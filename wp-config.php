<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'tp3wp');

/** MySQL database username */
define('DB_USER', 'root');

/** MySQL database password */
define('DB_PASSWORD', '');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8mb4');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'lxk:33@20qk.]u-L[CI!h).V~FpyD7|AEGv06zp.>dde-K1.ko;rQZU+bml10 l7');
define('SECURE_AUTH_KEY',  'c:CSN<*0z6C>A5&y&9`kPvF.zpk5L~Wr[-%1DLA$$G}0DNqMpzzb R4uJ!T^9s,2');
define('LOGGED_IN_KEY',    'ApS2ud%;Zi@=m6OT|J2M^9]6R1>Ml0U*{;[cK`)(XARJ6}hY8)}wh>f_HK9l;oaH');
define('NONCE_KEY',        'WA2f.*3|MB$CsD)!^*ES:(lBBlGKb&@_gVpI[n+co1_/4l|j6KYXSN,&x$!Q?!-H');
define('AUTH_SALT',        '$yh5q#?3==qttYh_Th5Dk{4Y9nzvvE;GfKJQe+]u}t!ND]UQQ%&X_;VwCImr=`Xx');
define('SECURE_AUTH_SALT', '1@73Zik}]IP%}>g^H,Tyyj%N#M0&H+`Zjlbe:?lI^QC]qAXr3O21NJlvx)/DAS+]');
define('LOGGED_IN_SALT',   'cVrY}4NpL5)}{2Qxx_,5PQ<abRHcVg4b[Yu}YCk8|?f_vfUEgKI#x6-6p`-6EU]O');
define('NONCE_SALT',       'U.xM5AK:6?4HOXq]OvVVaC>pNyl$1W+&Ez!Vz>.+`=Lc3?};3N8_*X77GKj+;xLV');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'tp3_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
