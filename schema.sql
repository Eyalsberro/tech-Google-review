CREATE DATABASE IF NOT EXISTS tech_reviews;
USE tech_reviews;

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  technician VARCHAR(50) NOT NULL,
  review_date DATE NOT NULL,
  address VARCHAR(255) NOT NULL,
  review_type ENUM('review', 'review_pic') NOT NULL,
  amount DECIMAL(5,2) NOT NULL,
  company ENUM('Premium', 'BSD', 'Rocky', 'Best Pro') NOT NULL,
  customer_name VARCHAR(255),
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  posted BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tech_date (technician, review_date),
  INDEX idx_review_date (review_date)
);
