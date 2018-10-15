# Pull base image
FROM python:3.6.6

# Set environment varibles
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /code

# Copy requirements
COPY ./requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt

# Copy project
COPY . .