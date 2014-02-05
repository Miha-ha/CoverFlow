/**
 * Реализация CoverFlow с помощью Three.js и Tween
 * @param cfg  - переопределяемые параметры
 * @constructor
 */
function CoverFlow(cfg){

    this.objects = [];
    this.targets = [];
    this.selected = 0;

    this.config = this.merge({
        cameraDistance: 760,
        spacing: 120,
        margin: 600,
        distance: 300,
        width: 800,
        height: 600,
        originDepth: -250,
        containerId: 'container',
        delay: 500
    }, cfg);

    this.origin = new THREE.Vector3(0, 0, this.config.originDepth);

    this.camera = new THREE.PerspectiveCamera(75, this.config.width / this.config.height, 1, 5000);
    this.camera.position.z = this.config.cameraDistance;

    this.scene = new THREE.Scene();

    this.renderer = new THREE.CSS3DRenderer();
    this.renderer.setSize(this.config.width, this.config.height);
    this.renderer.domElement.style.position = 'absolute';

    this.containerElement = document.getElementById(this.config.containerId);
    this.containerElement.appendChild(this.renderer.domElement);
}

/**
 * Слияние обектов
 * @param one
 * @param two
 * @returns one
 */
CoverFlow.prototype.merge = function (one, two){
    for (var prop in two) {
        if (two.hasOwnProperty(prop)) {
            one[prop] = two[prop];
        }
    }
    return one;
};

/**
 * Tween цикл анимации
 */
CoverFlow.prototype.animate = function (){
    requestAnimationFrame(this.animate.bind(this));
    TWEEN.update();
};

/**
 * Three.js отрисовка
 */
CoverFlow.prototype.render = function (){
    this.renderer.render(this.scene, this.camera);
};

/**
 * Установка элементов
 * @param items
 * @returns CoverFlow - для ораганизации кода цепочкой
 */
CoverFlow.prototype.setItems = function (items){
    var object,
        index = items.length;

    this.clear();

    this.selected = Math.floor(index / 2);

    //создание DOM
    while (--index >= 0) {
        var item = items[index];
        var cover = document.createElement('div');
        cover.className = 'cover';
        cover.style.backgroundImage = 'url(' + item.placeholder + ')';
        cover.uuid = item.uuid;
        cover.onclick = this.open.bind(this, item.uuid);

        var overlay = document.createElement('div');
        overlay.className = 'overlay';
        cover.appendChild(overlay);

        var title = document.createElement('h1');
        title.textContent = item.name;
        overlay.appendChild(title);

        object = new THREE.CSS3DObject(cover);

        if (i === 0) {
            object.position.x = 0;
            object.position.z = 0;
        } else {
            object.position.x = this.config.margin + index * this.config.spacing;
            object.position.z = -this.config.distance;
        }

        object.position.y = 0;

        object.lookAt(this.origin);

        this.scene.add(object);
        this.objects.push(object);
    }

    //формирование кеша всех возможных позиций
    var centered = this.objects.length - 1;
    for (var i = 0, count = items.length * 2 - 1; i < count; ++i) {
        object = new THREE.Object3D();
        var j;

        if (i < centered) {
            j = centered - i;
            object.position.set(-j * this.config.spacing - this.config.margin, 0, -this.config.distance);
            object.lookAt(this.origin);
        } else if (i > centered) {
            j = i - centered;
            object.position.set(j * this.config.spacing + this.config.margin, 0, -this.config.distance);
            object.lookAt(this.origin);
        } else {
            object.position.set(0, 0, 0);
            object.lookAt(new THREE.Vector3)
        }

        this.targets.push(object);
    }

    return this.select(this.selected);
};

/**
 * Переключение вперед
 * @returns CoverFlow - для организации цепочки вызовов
 */
CoverFlow.prototype.next = function (){
    if (this.selected + 1 < this.objects.length)
        return this.select(this.selected + 1);

    return this;
};

/**
 * Переключение назад
 * @returns CoverFlow - для организации цепочки вызовов
 */
CoverFlow.prototype.prev = function (){
    if (this.selected - 1 >= 0)
        return this.select(this.selected - 1);

    return this;
};

/**
 * Выбор жлемента по его индексу
 * @param index
 * @returns CoverFlow - для организации цепочки вызовов
 */
CoverFlow.prototype.select = function (index){
    var count = this.objects.length,
        i = count,
        object,
        target;

    this.selected = index;
    TWEEN.removeAll();

    while (--i >= 0) {
        object = this.objects[i];
        target = this.targets[count - 1 + this.selected - i];

        //{ x: target.position.x, y: target.position.y, z: target.position.z }
        new TWEEN.Tween(object.position)
            .to(target.position, this.config.delay)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();

        //{ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }
        new TWEEN.Tween(object.rotation)
            .to(target.rotation, this.config.delay)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
    }

    new TWEEN.Tween({}).to({}, 500)
        .onUpdate(this.render.bind(this))
        .start();

    return this;
};

/**
 * Обработка пользовательского ввода
 * @param e
 */
CoverFlow.prototype.inputHandler = function (e){
    switch (e.keyIdentifier) {
        case 'Left':
            this.prev();
            break;
        case 'Right':
            this.next();
            break;
    }
};

/**
 * Открытие объекта MegaVisor
 * @param uuid
 */
CoverFlow.prototype.open = function (uuid){
    try {
        new Megavisor.Player.Popup({
            uuid: uuid
        });
    } catch (errors) {
        console.error(errors.message);
    }
};

/**
 * Очистка беферов и DOM
 */
CoverFlow.prototype.clear = function (){
    var obj, i;
    for (i = this.scene.children.length - 1; i >= 0; i--) {
        obj = this.scene.children[i];
        this.scene.remove(obj);
    }
    this.objects = [];
    this.targets = [];
    this.selected = 0;

    var div = this.containerElement.firstChild.firstChild;
    while(div.firstChild) div.removeChild(div.firstChild);
};



