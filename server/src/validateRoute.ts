import { Router } from 'express';
import { validateCardRequest } from './middleware/validateRequest.js';
import { validateCard } from './cardValidator.js';
import { ROUTES } from './constants.js';

/** Card-validation routes. Mounted at the API prefix by the app factory. */
export const validateRouter = Router();

validateRouter.post(ROUTES.VALIDATE, validateCardRequest, (req, res) => {
  const { cardNumber } = req.body as { cardNumber: string };
  // 200: the request itself succeeded; card validity is reported in the body.
  res.json(validateCard(cardNumber));
});
