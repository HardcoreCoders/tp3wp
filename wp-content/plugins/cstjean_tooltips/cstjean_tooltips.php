<?php
   /*
   Plugin Name: Cstjean Tooltips
   Plugin URI: 
   Description: Un plugin pour afficher des infobulles partout sur votre site! VERY NICE!!
   Version: 1.0
   Author: Érik Béland & Steve Morin
   Author URI: http://bologne.club
   License: freeforall
   */


function register_infobulle() {
    $args = array(
      'public' => true,
      'label'  => 'Infobulles',
      'has_archive' => true
    );
    register_post_type( 'infobulle', $args );

    add_action( 'init', 'register_infobulle' );
 }


 
 
function create_infobulle_tax() {
     register_taxonomy(
         'type',
         'infobulle',
         array(
             'label' => __( 'Type' ),
             'rewrite' => array( 'slug' => 'type' ),
             'hierarchical' => true,
         )
     );

     add_action( 'init', 'create_infobulle_tax' );
 }

 function shortcode_infobulle($attrs, $content = null) {
    $a = shortcode_atts(
        array(
            'id' => '0'
        ), $attrs
       );

   $post = get_post($a['id']);
   $contenu = $post->post_content;
   
   return '<a data-cstjean_tooltips="' . $contenu . '">' . $content . '</a>';
}

add_shortcode('cstjean_tooltips', 'shortcode_infobulle');

function activation() {
    init();
    flush_rewrite_rules();
}

function init() {
    register_infobulle();
    create_infobulle_tax();
}

add_action('init', 'init');
register_activation_hook(__FILE__, activation);

function stylesScripts() {
    wp_enqueue_style('cstjean_tooltips', plugins_url('css/main.css', __FILE__), array(), '1.0.0');
    wp_enqueue_script('cstjean_tooltips', plugins_url('js/main.js', __FILE__), array('jquery'), '1.0.0', true);
}

add_action('wp_enqueue_scripts', 'stylesScripts');

?>