import { IConfig } from 'config';
import { Token } from 'typedi';

export const configToken = new Token<IConfig>('config');
