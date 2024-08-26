FROM python:3.10
EXPOSE 5000
WORKDIR /Backend
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools
RUN pip install --no-cache-dir --upgrade -r requirements.txt
COPY . .
ENV FLASK_ENV=development 
ENV PYTHONBUFFERED=1
CMD ["python3", "app.py"]

