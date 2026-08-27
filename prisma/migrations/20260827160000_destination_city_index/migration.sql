-- Vários destinos podem pertencer à mesma cidade (por exemplo, Bragança e Ajuruteua).
DROP INDEX `Destination_city_stateCode_key` ON `Destination`;
CREATE INDEX `Destination_city_stateCode_idx` ON `Destination`(`city`, `stateCode`);
