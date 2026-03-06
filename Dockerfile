# ---- Base image with PHP, Apache, and required extensions ----
FROM php:8.1-apache

# Install needed PHP extensions for Moodle
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev libzip-dev unzip git libicu-dev libpq-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd zip mysqli pdo pdo_mysql intl opcache pgsql pdo_pgsql

# Enable Apache rewrite module (Moodle needs it)
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Clone Moodle (stable version) into the container
RUN git clone -b MOODLE_403_STABLE https://github.com/moodle/moodle.git .

# Install Composer dependencies
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && composer install --no-dev --optimize-autoloader

# Create a writable data directory for Moodle files
RUN mkdir /var/www/moodledata && chown -R www-data:www-data /var/www/moodledata

# Setting up basic PHP config for Moodle
RUN echo 'memory_limit = 512M' >> /usr/local/etc/php/conf.d/docker-php-moodle.ini \
    && echo 'max_execution_time = 600' >> /usr/local/etc/php/conf.d/docker-php-moodle.ini \
    && echo 'max_input_vars = 5000' >> /usr/local/etc/php/conf.d/docker-php-moodle.ini \
    && echo 'post_max_size = 100M' >> /usr/local/etc/php/conf.d/docker-php-moodle.ini \
    && echo 'upload_max_filesize = 100M' >> /usr/local/etc/php/conf.d/docker-php-moodle.ini

# Expose HTTP port
EXPOSE 80

# Start Apache in the foreground
CMD ["apache2-foreground"]
