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
	`marketCap`	INTEGER
);
CREATE TABLE "currency" (
	`name`	TEXT NOT NULL UNIQUE,
	`fullName`	TEXT,
	`url`	TEXT,
	`imageUrl`	TEXT,
	`algorithm`	TEXT,
	PRIMARY KEY(`name`)
);
COMMIT;
