-- Fix existing listing images
-- This updates listings to include the URLs of uploaded images

USE roomio;

-- For listing ID 1 (2 plot of land)
UPDATE listings
SET images = JSON_ARRAY(
    'http://localhost/roomio/php-api/uploads/listing-images/listing_7_1759358966_68ddaff635af9.jpg',
    'http://localhost/roomio/php-api/uploads/listing-images/listing_7_1759358966_68ddaff63d324.JPG',
    'http://localhost/roomio/php-api/uploads/listing-images/listing_7_1759358966_68ddaff63f0dd.jpg',
    'http://localhost/roomio/php-api/uploads/listing-images/listing_7_1759358966_68ddaff641849.jpg',
    'http://localhost/roomio/php-api/uploads/listing-images/listing_7_1759358966_68ddaff643898.jpg'
)
WHERE id = 1;

-- For listing ID 2 (venaza car)
UPDATE listings
SET images = JSON_ARRAY(
    'http://localhost/roomio/php-api/uploads/listing-images/listing_7_1759332069_68dd46e5a8101.jpg',
    'http://localhost/roomio/php-api/uploads/listing-images/listing_7_1759332069_68dd46e5b19d6.JPG',
    'http://localhost/roomio/php-api/uploads/listing-images/listing_7_1759332069_68dd46e5b4b4b.jpg',
    'http://localhost/roomio/php-api/uploads/listing-images/listing_7_1759332069_68dd46e5b7db5.jpg',
    'http://localhost/roomio/php-api/uploads/listing-images/listing_7_1759332069_68dd46e5bb052.jpg'
)
WHERE id = 2;

-- For listing ID 3 (venaza house)
UPDATE listings
SET images = JSON_ARRAY(
    'http://localhost/roomio/php-api/uploads/listing-images/listing_7_1759331838_68dd45fe1713f.jpg',
    'http://localhost/roomio/php-api/uploads/listing-images/listing_7_1759331838_68dd45fe226d4.JPG',
    'http://localhost/roomio/php-api/uploads/listing-images/listing_7_1759331838_68dd45fe25581.jpg',
    'http://localhost/roomio/php-api/uploads/listing-images/listing_7_1759331838_68dd45fe2762c.jpg',
    'http://localhost/roomio/php-api/uploads/listing-images/listing_7_1759331838_68dd45fe29aa0.jpg'
)
WHERE id = 3;

-- Verify the update
SELECT id, title, type, JSON_LENGTH(images) as image_count, images
FROM listings;
