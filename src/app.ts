import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path";
import config from "./app/config";
import cron from 'node-cron'

// import cron from 'node-cron';
import router from "./router";
import notFound from "./middleware/notFound";
import globalErrorHandelar from "./middleware/globalErrorHandelar";
import auto_delete_unverified_user from "./utility/auto_delete_unverified_user";
import catchError from "./app/error/catchError";
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

const app = express();

// ======= Middlewares =======
app.use(cookieParser());

app.use(
  bodyParser.json({
    verify: (req: express.Request, _res, buf: Buffer) => {
      req.rawBody = buf;
    },
  })
);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  config.file_path as string,
  express.static(path.join(__dirname, 'public')),
);




// ======= CORS =======
app.use(cors());

// ======= Test Route =======
app.get("/", (_req, res) => {
  res.send({
    status: true,
    message: "Welcome to rishabhbhard-backend Server is running",
  });
});


cron.schedule("*/5 * * * *", async () => {
  try {
     await auto_delete_unverified_user();
    
  } catch (error: unknown) {
       catchError(error,'[Cron] Error in subscription expiry cron job:');
  }
});




// ======= API Routes =======
app.use("/api/v1", router);

// ======= 404 & Global Error Handler =======
app.use(notFound);
app.use(globalErrorHandelar);

export default app;
