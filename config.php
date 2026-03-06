<?php  // Moodle configuration file

unset($CFG);
global $CFG;
$CFG = new stdClass();

$url = parse_url(getenv('DATABASE_URL'));

$CFG->dbtype    = 'pgsql';
$CFG->dblibrary = 'native';
$CFG->dbhost    = $url['host'];
$CFG->dbname    = ltrim($url['path'], '/');
$CFG->dbuser    = $url['user'];
$CFG->dbpass    = $url['pass'];
$CFG->prefix    = 'her_';
$CFG->dboptions = array (
  'dbpersist' => 0,
  'dbport' => $url['port'],
  'dbsocket' => '',
  'dbcollation' => 'utf8mb4_unicode_ci',
);

$CFG->wwwroot   = getenv('RENDER_EXTERNAL_URL');
$CFG->dataroot  = '/var/www/moodledata';
$CFG->admin     = 'admin';

// Use this so Moodle doesn't get confused by Render's proxy/SSL
$CFG->reverseproxy = true;
$CFG->sslproxy = true;

$CFG->directorypermissions = 0777;

require_once(__DIR__ . '/lib/setup.php');

// There is no php closing tag in this file, it is intentional because it prevents trailing whitespace issues!
