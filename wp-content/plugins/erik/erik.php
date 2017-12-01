<?php
/**
 * @package erik
 * @version 1.0
 */
/*
Plugin Name: erik
Plugin URI: 
Description: Un beau plugin de bon joueux
Author: Erik
Version: 1.0
Author URI: http://bologne.club
*/  

function register_book() {
    $args = array(
      'public' => true,
      'label'  => 'Livres',
      'has_archive' => true
    );
    register_post_type( 'livre', $args );

    add_action( 'init', 'register_book' );
 }


 
 
function create_book_tax() {
     register_taxonomy(
         'genre',
         'livre',
         array(
             'label' => __( 'Genre' ),
             'rewrite' => array( 'slug' => 'genre' ),
             'hierarchical' => true,
         )
     );

     add_action( 'init', 'create_book_tax' );
 }

function activation() {
    init();
    flush_rewrite_rules();
}

function init() {
    register_book();
    create_book_tax();
}

add_action('init', 'init');
register_activation_hook(__FILE__, activation);

function stylesScripts() {
    wp_enqueue_style('erik', plugins_url('css/main.css', __FILE__), array(), '1.0.0');
    wp_enqueue_script('erik', plugins_url('js/main.js', __FILE__), array('jquery'), '1.0.0');
}

add_action('wp_enqueue_scripts', 'stylesScripts');