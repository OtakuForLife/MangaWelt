# Use an official Python runtime as a parent image
FROM python:3.11

# Install cron
RUN apt-get update && apt-get -y install cron

# Set the working directory
WORKDIR /app

COPY requirements.txt /app/
RUN pip install -r requirements.txt

# Copy the project code into the container
COPY . /app/

# Add crontab file in the cron directory
COPY crontab /etc/cron.d/app-cron

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/app-cron

# Apply cron job
RUN crontab /etc/cron.d/app-cron

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Create entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Run the command on container startup
ENTRYPOINT ["docker-entrypoint.sh"]
