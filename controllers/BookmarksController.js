const Repository = require('../models/Repository');

module.exports = 
class BookmarksController extends require('./Controller') {
    constructor(req, res){
        super(req, res);
        this.bookmarksRepository = new Repository('Bookmarks');
    }
    getAll(){
        this.response.JSON(this.bookmarksRepository.getAll());
    }

    ////////////////////////////////
    ///EXPLICATION DE CE QUE J'AI COMPRIS :
    ///EN DESSOUS, NOUS AVONS L'ENDROIT OÙ LES REQUÊTES GET SONT PRISE EN COMPTE
    ///IL Y A UN DOSSIER REPOSITORY QUI POSSÈDE TOUTES LES FONCTIONS APPELER EX : getAll();
    ///SI NOUS AVONS BESOIN DE RAJOUTER UNE FONCTION, C'EST DANS LE REPOSITORY
    ///LE BookmarksController.js EST LE FICHIER QUI REÇOIS TOUTES LES REQUÊTE DU FURTEUR
    ///LE Repository.js EST CELUI QUI RECHERCHE LES DONNÉES
    ///Bookmarks.json SONT LES DONNÉES
    ///
    ///
    ///
    ///TOUS CE JOUE ICI
    ///TOUS LES GET SONT TERMINÉS
    ///
    ///
    ///
    ///RESTE À FAIRE : 
    ///RÉUSSIR À CE QU'IL EN AILLE PLUSIEURS REQUÊTE EN MÊME TEMPS
    ///FAIRE UNE INTERFACE
    ///
    ///FAIT: LES REQUÊTES POST, PUT, DELETE
    ///
    ///////////////////////////////

    get(id){
        if(!isNaN(id)){
            this.response.JSON(this.bookmarksRepository.get(id));
        }
        else{
            
            let params = this.getQueryStringParams();
            console.log(params)
            if(params == null){
                this.response.JSON(this.bookmarksRepository.getAll());
            }
            else if(Object.entries(params).length === 0){
                this.response.JSON(this.bookmarksRepository.options());
            }
            else if(params.sort){
                if(params.sort.toLowerCase() == "name")
                    this.response.JSON(this.bookmarksRepository.sortName());
                else if(params.sort.toLowerCase() == "category")
                    this.response.JSON(this.bookmarksRepository.sortCategory());
                else
                    this.response.notFound();
            }
            else if(params.name){
                var lastChar = params.name.substr(params.name.length - 1);
                if(lastChar == '*'){
                    this.response.JSON(this.bookmarksRepository.searchNameBySpecificStart(params.name));
                }
                else{
                    this.response.JSON(this.bookmarksRepository.searchSpecificName(params.name));
                }
                
            }
            else if(params.category){
                this.response.JSON(this.bookmarksRepository.searchCategory(params.category));
            }

            //this.response.JSON(this.bookmarksRepository.getAll());
        }

    }
    
    post(bookmark){  
        let newBookmark = this.bookmarksRepository.addBookmark(bookmark);
        if (newBookmark)
            this.response.created(JSON.stringify(newBookmark));
        else
            this.response.internalError();
    }
    put(bookmark){
        let idOfBookmarkToModify =  this.req.url.split("/")[3];
        bookmark.Id = parseInt(idOfBookmarkToModify);
        if (this.bookmarksRepository.updateBookmark(bookmark))
            this.response.ok();
        else 
            this.response.notFound();
    }
    remove(id){
        if (this.bookmarksRepository.remove(id))
            this.response.accepted();
        else
            this.response.notFound();
    }
}