const
	express = require('express'),
	app = express(),
	morgan = require("morgan"),
	bodyParser = require("body-parser"),
	cookieParser = require("cookie-parser"),
	mongoose = require("mongoose"),
	dotenv = require("dotenv").config(),
	fs = require("fs"),
	expressValidator = require("express-validator"),
	cors = require("cors"),
	path = require('path'),

	postRoutes = require("./routes/post.js"),
	authRoutes = require("./routes/auth.js"),
	userRoutes = require("./routes/user.js"),

	port = process.env.PORT || 8080,
	mongo_uri = process.env.MONGO_URI;

mongoose.connect(mongo_uri, { useNewUrlParser: true })
.then(() => console.log("Conectado ao DB!"));
mongoose.connection.on("error", err => console.log("Erro na conexão do DB: ", err.message));

app.use(expressValidator());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors());

app.use('/', express.static('./public'));

app.use("/api/post", postRoutes);
app.use("/api", authRoutes);
app.use("/api/user", userRoutes);

app.use((err, req, res, next) => {
	if(err.name === "UnauthorizedError") return res.status(401).json({
		message: "Unauthorized!"
	});
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname + '/public', 'index.html' )));


app.listen(port, () => console.log(`Ouvindo na porta ${port}`));
