jQuery(document).ready(function($) {

	// sempre redimensionar section
	var $main = $('main');
	$main.css('height', $(window).height());

	$(window).on('resize', function(event) {
		$main.css('height', $(window).height());
	});

	// Botão que mostra as redes sociais
	var $btShare = $('.bt-share');
	var $redesSocias = $('.redes-sociais');

	$btShare.on('click', function(event) {
		event.preventDefault();
		$redesSocias.toggleClass('hidden');
	});

	// Envolver tables em scroller
	$('article table').wrap('<div class="table-scroller"></div>');

	// sumario de vídeos leva para o video já no tempo
	$('article.sumario .artigos.videos a').each(function(index, el) {
		var textTime = $(el).children('p:first-child').text().split(':');
		var videoTimeUrl = parseInt(textTime[0])*60+parseInt(textTime[1]);
		var currentHref = $(el).attr('href');
		$(el).attr('href', currentHref+'?t='+videoTimeUrl);
	});


	// Fazendo os videos pularem para os tempos escolhidos.
	var $videodepoimento = $('video.videodepoimento');
	$videodepoimento.on('loadeddata', function(event) {
		console.log('carregou');
		var query = window.location.search.substring(1).split('=');
		if ( 
		query.length === 2 
		&& query[0] === 't' 
		&& Number.isInteger( parseInt(query[1]) ) 
		) {
			var timeQuery = parseInt(query[1]);
			$videodepoimento[0].currentTime = timeQuery;	
		}

		var $linksInternosVideos = $('aside.links-videos a');
		$linksInternosVideos.each(function(index, el) {
			var hrefTime = $(el).children('p').first().text().split(':');
			var newTime = parseInt(hrefTime[0])*60+parseInt(hrefTime[1]);
			$(el).data('timeInSec', newTime);
			$(el).on('click', function(event) {
				event.preventDefault();
				$videodepoimento[0].currentTime = newTime;
				checkTempoAtual();
			});
		});


		var checkTempoAtual = function(){
			var tempoAtualVideo = $videodepoimento[0].currentTime;
			var linkAtual = 0; 
			$linksInternosVideos
			.each(function(index, el) {
				if (tempoAtualVideo > $(el).data('timeInSec')-3) {
					linkAtual = index;
				}
			})
			.removeClass('atual')
			.eq(linkAtual)
			.addClass('atual');
		};

		checkTempoAtual();

		var loopCheckTime;
		$videodepoimento
		.on('play playing', function(event) {
			loopCheckTime = setInterval(checkTempoAtual, 1000);
		})
		.on('pause', function(event) {
			clearInterval(loopCheckTime);
		});;

	});


	// Botões que trocam a língua do resumo
	var $btsLinguas = $('.seletor-lingua > button');
	var $resumos = $('.resumo');

	$btsLinguas.on('click', function(event) {
		var langDoBt = $(this).attr('data-lang');
		$btsLinguas.removeClass('atual');
		$(this).addClass('atual');
		$resumos
		.addClass('hidden')
		.filter('[data-lang="'+langDoBt+'"]')
		.removeClass('hidden');
	});


	// Galeria de imagens

	$.fancybox.defaults.transitionEffect = 'slide';
	var $galerias = $('section.galeria');


	$galerias.each(function(index, el) {
		var futureAnchorsGaleria = [];
		var $thisGaleria = $(el);
		$thisGaleria.find('figure').each(function(index2, el2) {
			var futureAnchor = $('<a></a>').attr({
				'href': $(el2).children("img").attr("src"),
				'data-fancybox': 'galeria-'+(index+1),
				'data-caption': $(el2).children("figcaption").html(),
				'style': 'background-image: url('+$(el2).children("img").attr("src")+')'
			});

			$(el2).after(futureAnchor);
			$(el2).remove();
		});

		$thisGaleria.addClass('loaded');
	});

	// Fotos solitarias tambem merecem zoom!
	var $fotos_sozinhas = $('article > figure');
	$fotos_sozinhas.each(function(index, el) {
		$(el).find('img').on('click', function(event) {
			$.fancybox.open([
				{
					src  : $(this).attr('src'),
					opts : {
						caption : $(el).find('figcaption').html(),
						thumb   : $(this).attr('src')
					}
				},
				
			])
		});
	});

	// Minicurriculos retráteis
	var $boxAutores = $('aside.autores');

	if ($boxAutores.length > 0) {
		$boxAutores.find('.toggle').on('click', function(event) {
			$(this).parent().toggleClass('collapsed');
		});
		var $autor = $boxAutores.find('.autor');
		$autor.each(function(index, el) {
			var $autorLoop = $(el);
			$(el).find('h3').on('click', function(event) {
				if ($autorLoop.hasClass('atual')) {
					$autorLoop
					.removeClass('atual')
					.find('.img-e-mini')
					.css('height', $autor.find('.img-e-mini').outerHeight())
					.stop()
					.animate({'height': '0px'}, 300, function() {
						$autorLoop
						.find('.img-e-mini')
						.removeClass('db')
						.css('height', '');
					});
				}else {
					if ($autor.filter('.atual').length > 0) {
						var $autorAtual = $autor.filter('.atual');

						$autorAtual
						.removeClass('atual')
						.find('.img-e-mini')
						.css('height', $autor.find('.img-e-mini').outerHeight())
						.stop()
						.animate({'height': '0px'}, 300, function() {
							$autorAtual
							.find('.img-e-mini')
							.removeClass('db')
							.css('height', '');
						});
					}


					$autorLoop.addClass('atual').find('.img-e-mini').addClass('db');
					var heightFromAuto = $autorLoop.find('.img-e-mini').outerHeight();
					$autorLoop
					.find('.img-e-mini')
					.css('height', 0)
					.stop()
					.animate({'height': heightFromAuto+'px',}, 300, function() {
						$autorLoop
						.find('.img-e-mini')
						// .addClass('db')
						.css('height', '');
					});
					
				}
			});
		});
	}



	// Botões que navegam pelas páginas
	var $paginas = $('.paginacao');
	var topPaginas = [];
	var $btsNavPag = $('.pag-nav > button');
	var pagAtual = 1;
	var $caixa = $('section');

	if ($paginas.length > 0) {

		var attPagTops = function(){
			topPaginas = [];
			$paginas.each(function(index, el) {
				topPaginas.push($(el).position().top);
			});
		};

		attPagTops();

		var timeOutResize;

		$(window)
		.on('load', function(event) {
			attPagTops();
		})
		.on('resize', function(event) {
			clearTimeout(timeOutResize);
			timeOutResize = setTimeout(function(){
				attPagTops();
			},300);
		});

		var scrollAtual = $caixa.scrollTop();
		var allowDetectScroll = true;

		var checkCurrentPage = function(){
			if (allowDetectScroll === true) {
				$.each(topPaginas, function(index, val) {
					 if (scrollAtual > val - $caixa.height()*0.3) {
					 	pagAtual = index+1;
					 } else{
					 	return false;
					 }
				});
			}
		}

		checkCurrentPage();

		$caixa.on('scroll', function(event) {
			checkCurrentPage();
			scrollAtual = $caixa.scrollTop();
		});



		$btsNavPag.on('click', function(event) {
			var increment;
			var condition;
			if ($(this).hasClass('bt-prev-pag')) {
				increment = -1;
				condition = pagAtual > 1;
			} else if ($(this).hasClass('bt-next-pag')) {
				increment = 1;
				condition = pagAtual < topPaginas.length;
			}
			if (condition) {
				pagAtual = pagAtual + increment;
				allowDetectScroll = false;
				$caixa.stop().animate({'scrollTop': topPaginas[pagAtual-1] - topPaginas[0]}, 300, function(){
					allowDetectScroll = true;
				});
			}
		});
	}

	// redes sociais
	var $redesSociais = $('.redes-sociais > a');
	if ($redesSociais.length > 0) {
		var encodedCurrentUrl = encodeURIComponent(window.location.href);
		$redesSociais.each(function(index, el) {
			$(el).attr('href', $(el).attr('data-template')+encodedCurrentUrl);
		});
	}

	// notas de rodapé
	var $btNotas = $('.bt-nota-rodape');
	var $notas = $('.nota-rodape');
	var $artigo = $('article');
	var notaAtual = '';
	var widthMedium = 1100;

	$notas.prepend('<button class="fechar"></button>');

	$notas.find('.fechar').on('click', function(event) {
		$(this).parent().removeClass('visivel').css('top', '-1000px');
		notaAtual = '';
		
	});
	

	$btNotas.on('click', function(event) {
		$boxAutores.toggleClass('collapsed');	
		var widthWindow = $(window).width();
		var nClicada = $(this).attr('data-nota');
		if (notaAtual === nClicada) {
			$notas.removeClass('visivel').css('top', '-1000px');
			notaAtual = '';
		}else{
			var $notaFutura = $notas.filter('[data-nota="'+nClicada+'"]');
			var topNotaFutura = 
			$(this).position().top - 
			(widthWindow <= widthMedium ? $notaFutura.outerHeight() + $(this).outerHeight() : 0);
			if (topNotaFutura + $notaFutura.outerHeight() > $artigo.height()) {
				topNotaFutura = $artigo.height() - $notaFutura.outerHeight();
			}
			$notas.removeClass('visivel').css('top', '-1000px');
			$notaFutura.css('top', topNotaFutura+'px').addClass('visivel');
			notaAtual = nClicada;
		}
	});
});














