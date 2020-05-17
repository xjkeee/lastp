function TimeFormat(time) {
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = ~~time % 60;
    var ret = "";
    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

$(function () {
    //Перерасчёт vh, адаптирует высоту в мобильных браузерах при появлении\исчезновении адресной строки
    var vh = window.innerHeight * 0.01, StopVhChanging = false, StoppedValue = vh;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    var vhHandler = function() {
        // получаем текущее значение высоты
        if (StopVhChanging) return document.documentElement.style.setProperty('--vh', `${StoppedValue}px`);
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setInterval(()=> StopVhChanging? 0 : StoppedValue = vh, 300);


    $(window).bind('resize', vhHandler);
        //Не реагируем на всплытие клавиатуры на мобильниках
        $('input').focus(()=> StopVhChanging = true);
        $('input').focusout(()=>StopVhChanging = false);

    // < Работа с видео >
    var vid = document.getElementById("video"), vidanimation = false, vidplay = false, vidposition = $("#video").offset().top, vidheight = $('#video').outerHeight(), newposition = 0, newheight = 0, lasttime = 0;
    vid.onloadedmetadata = function () {
        $('.video__duration').text(TimeFormat(parseInt(vid.duration)));
        vid.volume = 0.2;
    };

    var fullsceen = false;
    $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', function(e)
    {
        fullsceen = !fullsceen;
    });
    
    function CloseVid() {
        vidanimation = true;
        vidplay = false;
        vid.pause();
        $('.header').removeClass('disappears-smoothy');
        $('.video__container>*').removeClass('disappears');
        $('.video__container>*').addClass('appears');
        $('.video__container').removeClass('growingDark');
        $('.video__container').addClass('fadingDark');

        setTimeout(function () {
            $('.video').removeClass('video_extended');
            $('.video__container>*').removeClass('appears');
            $('.video__container').removeClass('fadingDark');
            vidanimation = false;
        }, 2000);

        $('#video').removeClass('appears');
    }
    //Нажатие на кнопку воспроизведения
    $('.video__playbutton i').click(function () {

        if (vidanimation) return;
        vidposition = $("#video").offset().top; vidheight = $('#video').outerHeight();
        newposition = $("#video").offset().top;
        $('.header').addClass('disappears-smoothy');
        $('.video__container>*').addClass('disappears');
        $('.video__container').addClass('growingDark');
        $('.video').addClass('video_extended');
        $([document.documentElement, document.body]).animate({
            scrollTop: parseInt(vidposition - (100 * vh - vidheight) / 2)
        }, 800);


        setTimeout(function () {
            vidplay = true;
        }, 800);
        setTimeout(function () {
            $('#video').addClass('appears');
            vid.play();
            newheight = $('#video').outerHeight();
        }, 500);
    });

    vid.onpause = function (event) {
        //Сворачивает видео, если пользователь решил поставить его на паузу
        lasttime = vid.currentTime;
        setTimeout(() => vid.currentTime == lasttime ? CloseVid() : 0, 2000);
    };
    // </ Работа с видео >

    //Запоминание исходных размеров выпадающих списков, используется в мобильном меню
    $('.appearing-list').each(function (item) {
        $(this).attr('data-height', $(this).outerHeight() + 'px');
    });

    //Контроль разрешения экрана, измененяет интерактивные элементы  при ресайзе и следующем смене вёрстки на мобильную и обратно
    var T = Math.sign($('body').first().outerWidth() - 768);
    var menufeatures = function () {
        if (T < 0) {
            $('.appearing-list').css('animation-delay', '0s');
            $('.appearing-list').css('animation-duration', '0s');
            $('.appearing-list').css('opacity', '1');
            $('.menu__filler').removeClass('hidden');
            if ($('.burger').hasClass('active'))
                $('.menu').transition({ x: 0 }, 400);
        }
        else {
            $('.menu').removeClass('.menu_blured');
            $('.menu__filler').addClass('hidden');
            $('.appearing-list').css('opacity', '0');
            $('.appearing-list').css('animation-delay', '.2s');
            $('.appearing-list').css('animation-duration', '.4s');
            $('.appearing-list').removeClass('appearing-list_show');
            $('.menu').css('transform', 'none');
        }
    }
    menufeatures();
    window.addEventListener("resize", function () {
        _triggervalue = $(".spec").offset().top, _endtrigger = $('.info').offset.top
        let a = Math.sign($('body').first().outerWidth() - 768);
        if (a != T && a != 0) {
            T = a;
            menufeatures();
        }
    }, false);

    //Обработка мобильного меню, блокирование скролла при его открытии
    const body = document.querySelector('#body');
    $('.burger, .appearing-list__link').click(function () {
        if (T > 0) return;
        if ($('.menu').offset().left < 0) {
            $('.menu').transition({ x: '0' }, 400);
            $('.burger').addClass('active');
            bodyScrollLock.disableBodyScroll(body);
        }
        else {
            $('.menu').transition({ x: '-300px' }, 400);
            $('.burger').removeClass('active');
            bodyScrollLock.enableBodyScroll(body);
        }
    });

    //Автоматический скролл при нажатии на кнопку Get Started
    var _triggervalue = $(".spec").offset().top, _endtrigger = $('.info').offset.top;
    $('.mainTitle__button').click(function () {
        $([document.documentElement, document.body]).animate({
            scrollTop: $(".spec").offset().top
        }, 800);
    });

    //Обработка всплытия меню, проверка видимости видео при его воспроизведении
    var menu__trigger = 0, prevValue = 0;
    ScrollHandler = function () {
        if (!fullsceen && vidplay && (pageYOffset + 100 * vh < newposition + newheight || pageYOffset > newposition)) 
            CloseVid();

        if (pageYOffset <= _triggervalue || pageYOffset > _endtrigger) {
            if (!menu__trigger) return;
            $('.header').removeClass('header_ready');
            $('.header').removeClass('header_blured');
            $('.menu').removeClass('menu_blured');
            return menu__trigger = 0;
        }
        else 
            if (!$('.header').hasClass('header_ready')) $('.header').addClass('header_ready');

        if (pageYOffset >= prevValue)
            if (!menu__trigger) return prevValue = pageYOffset;
            else {
                $('.header').removeClass('header_blured');
                $('.menu').removeClass('menu_blured');
                return (menu__trigger = 0) + (prevValue = pageYOffset);
            }
        $('.header').addClass('header_ready');
        $('.header').addClass('header_blured');
        if (T < 0)
            $('.menu').addClass('menu_blured');

        menu__trigger = 1;
        prevValue = pageYOffset;
    };
    $(window).bind('scroll', ScrollHandler);

    //Логика всплытий на мобильном меню
    function aplist__mobileTransition(el) {
        if (el.length == 0 || T > 0)
            return;
        if (el.hasClass('appearing-list_show')) {
            let height = el.attr('data-height');
            el.addClass('gag');
            el.removeClass('appearing-list_show');
            el.transition({ 'max-height': '0px' }, 400, 'linear');
            setTimeout(function () {
                el.removeClass('gag');
                el.css('height', height);
                el[0].style.height = height;
            }, 450);
        }
        else {
            aplist__mobileTransition($('.appearing-list_show').first());
            let height = el.attr('data-height');;
            el.css('max-height', '0px');
            el.css('height', height);
            el.addClass('appearing-list_show');
            el.transition({ 'max-height': height }, 400, 'linear');
        }
    }
    $('.menu__link').click(function () {
        aplist__mobileTransition($(this).children().last());
    });

    //Работа поиска
    $('header .fa-search, .fa-times').click(function () {
        if ($('.burger').hasClass('active'))
            $('.burger').trigger('click');
        $('.header__container').toggleClass('header__container_spacebetween');
        $('.header-icons').toggleClass('hidden');
        $('.search-input').toggleClass('hidden');
    });


    $('.fa-search').click(function () {
        if (T < 0 && $('body').first().outerWidth() <= 410) {
            $('.header__container .logo-block').addClass('hidden');
        }

        if (T < 0) return;
        if ($('body').first().outerWidth() >= 1000) {
            $('.search-input').css('max-width', '31px');
            $('.search-input').transition({ 'max-width': '400px' }, 500);
        }
        else {
            $('.menu').toggleClass('hidden');
        }
    });

    $('.fa-times').click(function () {
        $('.menu').removeClass('hidden');
        $('header .logo-block').removeClass('hidden');
        if (T > 0 && $('body').first().outerWidth() >= 1000) {
            $('.menu__filler').removeClass('hidden')
            $('.menu__filler').css('display', 'block');
            $('.menu__filler').css('width', '300px');
            $('.menu__filler').transition({ width: 0 }, 500, 'ease', () => T > 0 ? $('.menu__filler').addClass('hidden') : 0);

        }
    });

    new WOW().init();

    
    function ibg() {
        $.each($('.ibg'), function (index, val) {
            if ($(this).find('img').length > 0) {
                $(this).css('background-image', 'url("' + $(this).find('img').attr('src') + '")');
            }
        });


    }
    ibg();

    $('.counter').counterUp({ time: 1000 });

    //Слайдеры
    $('.slider').slick({
        fade: true,
        speed: 1000,
        dots: true,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnFocus: false,
        pauseOnHover: false
    });

    $('.posts_slider').slick({
        speed: 1000,
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 3,
        rows: 1,
        responsive: [
            {
                breakpoint: 950,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    infinite: true
                }
            },

            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true
                }
            }
        ]
    });

    $('.mount-logo__slider').slick({
        speed: 1000,
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        rows: 1,
        prevArrow: false,
        nextArrow: false,
        autoplay: true,
        centerMode: true,
        autoplaySpeed: 1000,
        pauseOnFocus: false,
        pauseOnHover: false,
        responsive: [
            {
                breakpoint: 850,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    centerPadding: 0,
                    centerMode: true
                }
            }]
    });



});