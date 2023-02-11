ALTER TABLE `owned_vehicles` 
ADD `insurance` VARCHAR(100) NOT NULL DEFAULT 'none' AFTER `state`,
ADD `cooldown` INT NOT NULL DEFAULT '0' AFTER `insurance`;