import { SetMetadata } from '@nestjs/common';

export const ES_PUBLICO_KEY = 'esPublico';

/** Marca un endpoint como accesible sin token. */
export const Publico = () => SetMetadata(ES_PUBLICO_KEY, true);
