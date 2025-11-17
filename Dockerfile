FROM php:8.2-apache

# Enable Apache mod_rewrite for clean URLs
RUN a2enmod rewrite

# Install any additional PHP extensions if needed
# RUN docker-php-ext-install pdo pdo_mysql

# Set working directory
WORKDIR /var/www/html

# Copy all web files to Apache document root
COPY ./public /var/www/html

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Configure Apache to listen on port 7860 (required by Hugging Face Spaces)
RUN sed -i 's/80/7860/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# Expose port 7860
EXPOSE 7860

# Start Apache in foreground
CMD ["apache2-foreground"]
