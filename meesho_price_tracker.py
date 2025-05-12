import csv
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()  # Make sure chromedriver is installed and in PATH

try:
    driver.get("https://www.meesho.com/apple-iphone-16-plus-256gb-pink/p/7cx6ao")
    price_tag = driver.find_element(By.CSS_SELECTOR, ".sc-eDvSVe.biMVPh")
    price = price_tag.text.replace("₹", "").replace(",", "").strip()
    print("Extracted price:", price)
    with open("meesho_price_history.csv", "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), price])
except Exception as e:
    print("Price not found or error:", e)
finally:
    driver.quit()