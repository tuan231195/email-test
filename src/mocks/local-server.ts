import express, { Request, Response } from 'express';
import { handler } from 'src/handlers/email-sender.handler';
import { initContainer } from 'src/container';
import { LoggingService } from 'src/core/logging/services/logging.service';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post('/email', async (req: Request, res: Response) => {
	const { headers, body, statusCode } = await handler({
		body: JSON.stringify(req.body),
	});
	res.status(statusCode)
		.set(headers)
		.send(body);
});
const port = process.env.PORT || 5000;

app.listen(port, async () => {
	const container = await initContainer();
	const logger = container.get(LoggingService);
	logger.info(`App is listening on port ${port}`);
});
