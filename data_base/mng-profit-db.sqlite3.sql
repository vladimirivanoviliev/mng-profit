BEGIN TRANSACTION;
CREATE TABLE `history` (
	`id`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`name`	TEXT,
	`difficulty`	REAL,
	`nethash`	REAL,
	`exchangeRate`	REAL,
	`blockTimeSeconds`	INTEGER,
	`lastBlock`	INTEGER,
	`blockReward`	REAL,
	`marketCap`	INTEGER,
	`dayProfit` REAL,
	`hourProfit` REAL,
	`date` INTEGER
);
CREATE TABLE "currency" (
	`name`	TEXT NOT NULL UNIQUE,
	`fullName`	TEXT,
	`url`	TEXT,
	`imageUrl`	TEXT,
	`algorithm`	TEXT,
	`date` INTEGER,
	PRIMARY KEY(`name`)
);
COMMIT;
