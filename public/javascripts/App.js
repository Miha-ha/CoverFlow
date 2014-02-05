(function (){
    var coverFlow,
        elSearchInput,
        socket;

    /**
     * Инициализация
     */
    function init(){
        coverFlow = new CoverFlow();

        window.addEventListener('keydown', moderator(coverFlow.inputHandler, 3, coverFlow), true);
        elSearchInput = document.getElementById('searchInput');
        document.forms['searchForm'].onsubmit = onSubmit;

        socket = io.connect(document.location.href);
        socket.on('result', function (data){
            try {
                var res = JSON.parse(data);
                if(!res || res.errors) throw new Error(res.errors.message);
                coverFlow.setItems(res.items).animate();
            } catch (e) {
                alert(e.message);
            }
        });

    }

    /**
     * Отправка данных на сервер
     * @returns {boolean}
     */
    function onSubmit(){
        socket.emit('submit', elSearchInput.value);
        return false;
    }

    /**
     * Вход:  функция, частота вызовов в секунду и контекст выполнения
     * Выход: функция, котороя выполняется не чаще freq раз в секунду
     * @param fn
     * @param freq
     * @param scope
     * @returns {Function}
     */
    function moderator(fn, freq, scope){
        var sleep = 1000 / freq,
            lastTime = 0;

        return function (){
            var curTime = new Date().getTime();

            if (curTime - lastTime >= sleep) {
                lastTime = curTime;
                fn.apply(scope, arguments);
            }
        }
    }

    init();
}());
