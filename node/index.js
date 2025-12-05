const express = require("express");
const mysql = require("mysql");

const app = express();
const PORT = 3000;

const config = {
	host: "db",
	user: "root",
	password: "root",
	database: "fullcycle",
};

function connectDatabase() {
	const connection = mysql.createConnection(config);
	return connection;
}

async function initializeDatabase() {
	return new Promise((resolve, reject) => {
		const connection = connectDatabase();

		const createTableSQL = `
      CREATE TABLE IF NOT EXISTS people (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )
    `;

		connection.query(createTableSQL, (error) => {
			if (error) {
				console.error("Error creating table:", error);
				connection.end();
				reject(error);
			} else {
				console.log("Table people initialized successfully");
				connection.end();
				resolve();
			}
		});
	});
}

async function waitForDatabase() {
	return new Promise((resolve) => {
		const maxAttempts = 30;
		let attempts = 0;

		const tryConnect = () => {
			attempts++;
			const connection = connectDatabase();

			connection.connect((err) => {
				if (err) {
					console.log(
						`Database connection attempt ${attempts}/${maxAttempts} failed, retrying...`,
					);
					connection.end();

					if (attempts >= maxAttempts) {
						console.error(
							"Failed to connect to database after maximum attempts",
						);
						process.exit(1);
					} else {
						setTimeout(tryConnect, 2000);
					}
				} else {
					console.log("Database connected successfully");
					connection.end();
					resolve();
				}
			});
		};

		tryConnect();
	});
}

async function createPerson(name) {
	const connection = connectDatabase();
	const sql = `INSERT INTO people (name) VALUES (?)`;

	return new Promise((resolve, reject) => {
		connection.query(sql, [name], (error) => {
			if (error) {
				console.error("Error creating person:", error);
				reject(error);
			} else {
				resolve();
			}
			connection.end();
		});
	});
}

async function getPeopleList() {
	const connection = connectDatabase();
	const sql = `SELECT * FROM people ORDER BY id`;

	return new Promise((resolve, reject) => {
		connection.query(sql, (error, results) => {
			connection.end();

			if (error) {
				console.error("Error getting people list:", error);
				reject(error);
			} else {
				let names = "";
				for (const person of results) {
					names += `<li>${person.name}</li>`;
				}
				resolve(`<ul>${names}</ul>`);
			}
		});
	});
}

app.get("/", async (req, res) => {
	try {
		const suffix = Math.floor(1000 + Math.random() * 9000);
		const name = `Luiz ${suffix}`;
		await createPerson(name);
		const names = await getPeopleList();
		res.send("<h1>Full Cycle Rocks!</h1>" + names);
	} catch (error) {
		console.error("Error in route:", error);
		res
			.status(500)
			.send("<h1>Error</h1><p>An error occurred processing your request.</p>");
	}
});

async function startServer() {
	try {
		await waitForDatabase();
		await initializeDatabase();

		app.listen(PORT, () => {
			console.log("Server started on port " + PORT);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
}

startServer();
