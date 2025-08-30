# Use official Python image
FROM python:3.11

# Create app directory
WORKDIR /backend

# Copy all backend files directly into /backend
COPY backend/ ./

# Install dependencies if you have requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Expose port used by your Python app
EXPOSE 5000

# Start the Python server
CMD ["python3", "app.py"]
