const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, likesService, storageService, validator) {
    this._service = service;
    this._likesService = likesService;
    this._storageService = storageService;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }
  async postUploadCoverHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    await this._service.editAlbumCoverById(id, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.getAlbumById(albumId);
    await this._likesService.addLike(userId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Menyukai album',
    });
    response.code(201);
    return response;
  }

  async deleteLikeHandler(request) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._likesService.deleteLike(userId, albumId);

    return {
      status: 'success',
      message: 'Batal menyukai album',
    };
  }

  async getLikesHandler(request, h) {
    const { id: albumId } = request.params;

    const { count, source } = await this._likesService.getLikesCount(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes: count,
      },
    });
    
    if (source === 'cache') {
      response.header('X-Data-Source', 'cache');
    }
    
    return response;
  }
}

module.exports = AlbumsHandler;