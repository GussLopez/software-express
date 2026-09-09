export default function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El cuerpo debe contener JSON válido' });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      message: 'El cuerpo de la solicitud es demasiado grande',
    });
  }

  if (error.status === 400 || error.status === 409) {
    return res.status(error.status).json({ message: error.message });
  }

  console.error('Error al procesar la solicitud:', error.code || error.name);

  return res.status(500).json({ message: 'Error interno del servidor' });
}
