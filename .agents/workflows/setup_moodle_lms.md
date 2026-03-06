---
description: How to set up Moodle as the LMS for your project on macOS
---

## Overview
This workflow guides you through installing and configuring **Moodle** on macOS to serve as the Learning Management System (LMS) for your application. It covers system prerequisites, downloading Moodle, setting up a local web server, creating the database, running the Moodle installer, and optional integration steps (e.g., SSO, API access).

## Prerequisites
1. **Homebrew** installed (https://brew.sh/)
2. **PHP 8.1+** with required extensions
3. **MySQL** (or MariaDB) server
4. **Composer** (for optional plugins)
5. **Git**
6. A web server (Apache or Nginx). The steps below use **Apache** for simplicity.

## Steps
1. **Install required packages**
   ```bash
   # Install PHP, MySQL, Apache, and Composer
   brew install php@8.1 mysql apache2 composer git
   ```
   // turbo
2. **Start services**
   ```bash
   brew services start mysql
   brew services start php@8.1
   brew services start httpd   # Apache
   ```
   // turbo
3. **Create a MySQL database and user for Moodle**
   ```bash
   mysql -u root -p -e "CREATE DATABASE moodle DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   mysql -u root -p -e "CREATE USER 'moodleuser'@'localhost' IDENTIFIED BY 'StrongPassword123!';"
   mysql -u root -p -e "GRANT ALL PRIVILEGES ON moodle.* TO 'moodleuser'@'localhost';"
   mysql -u root -p -e "FLUSH PRIVILEGES;"
   ```
   // turbo
4. **Download Moodle**
   ```bash
   cd /usr/local/var/www   # Apache default document root on macOS via Homebrew
   sudo git clone -b MOODLE_403_STABLE https://github.com/moodle/moodle.git
   cd moodle
   sudo composer install --no-dev --optimize-autoloader
   ```
   // turbo
5. **Set correct permissions**
   ```bash
   sudo chown -R $(whoami):staff /usr/local/var/www/moodle
   sudo chmod -R 755 /usr/local/var/www/moodle
   ```
   // turbo
6. **Configure Apache**
   Edit `/usr/local/etc/httpd/httpd.conf` and add:
   ```apacheconf
   <Directory "/usr/local/var/www/moodle">
       Options Indexes FollowSymLinks
       AllowOverride All
       Require all granted
   </Directory>
   
   DocumentRoot "/usr/local/var/www/moodle"
   ```
   Then restart Apache:
   ```bash
   brew services restart httpd
   ```
   // turbo
7. **Run the Moodle web installer**
   Open a browser and navigate to `http://localhost`. Follow the on‑screen wizard:
   - Choose language
   - Confirm paths (web address: `http://localhost`, data directory: `/usr/local/var/www/moodledata`)
   - Select database type **MySQL** and enter the credentials created in step 3
   - Complete the installation, creating the admin account.

8. **Post‑install configuration**
   - Log in as admin and set up **site name**, **theme**, **email settings**.
   - Install needed plugins via *Site administration → Plugins → Install plugins* or using Composer.
   - Enable **HTTPS** (recommended) by configuring Apache with an SSL certificate (e.g., mkcert).

9. **Optional: Integrate with your existing app**
   - **SSO / OAuth2**: Use the *Moodle OAuth2 services* plugin to allow users to log in with Google, Azure AD, etc.
   - **REST API**: Enable *Web services* in *Site administration → Advanced features* and generate a token for your backend to interact with courses, enrolments, grades.
   - **Embedding**: Use Moodle’s *iframe* or *LTI* integration to embed course content inside your custom frontend.

10. **Backup & Maintenance**
    - Schedule regular database dumps: `mysqldump -u moodleuser -p moodle > moodle_backup_$(date +%F).sql`
    - Keep Moodle core updated: `cd /usr/local/var/www/moodle && git pull && composer install`
    - Monitor logs: Apache (`/usr/local/var/log/httpd/error_log`) and PHP (`/usr/local/var/log/php-fpm.log`).

## Quick Reference Commands
| Action | Command |
|--------|---------|
| Start services | `brew services start mysql php@8.1 httpd` |
| Stop services | `brew services stop mysql php@8.1 httpd` |
| Create DB | *(see step 3)* |
| Update Moodle | `cd /usr/local/var/www/moodle && git pull && composer install` |
| Backup DB | `mysqldump -u moodleuser -p moodle > backup.sql` |

---
**Note**: Adjust paths if you use a different document root or prefer Nginx. The workflow can be adapted for Docker or cloud deployments by swapping the local service steps with container orchestration commands.
