/**
 * Plugin qui affiche des info-bulles
 * 
 * @author Steve Morin et Érik Béland
 */
jQuery(document).ready(function($) {
(function ($) {
    /**
     * Appel Ajax pour augmenter le nombre d'affichages d'info-bulles dans la base de données
     */
    function incrementerCompteur() {
        $.ajax({
            method: "POST",
            url: "wp-content/plugins/cstjean_tooltips/php/compteur.php",
            data: { 'chemin' : window.location.href },
        }).done(function( json ) {
            console.log(json);
        });
    }

    /**
     * Cette fonction affiche une info-bulle sur les balise avec l'attribut "data-cstjean_tooltips"
     */
    $.fn.cstjean_tooltips = function() {
        // On cible l'attribut 'data-cstjean_tooltips'
        valeur = $('[data-cstjean_tooltips]').attr('data-cstjean_tooltips');

        // On génère un info-bulle
        tooltip = $('<div class="tooltip"></div>').html(valeur); 

        $('[data-cstjean_tooltips]').on('mouseenter', function() {          
            tooltip.appendTo('body');
            tooltip.fadeIn(200, 'swing');
            incrementerCompteur();
        });

        $('[data-cstjean_tooltips]').on('mousemove', function(e) {
            tooltip.css({
                left: e.pageX + 40,
                top:  e.pageY + 20,
                'z-index' : 9999
            });
        });

        $('[data-cstjean_tooltips]').on('mouseout', function() {
            tooltip.fadeOut(200, 'swing', function() {
                tooltip.remove();
            });
        });

        return this;
    };

    $('a').cstjean_tooltips();
}(jQuery));

});

