
const fs = require('fs');
///////////////////////////////////////////////////////////////////////////
// This class provide CRUD operations on JSON objects collection text file 
// with the assumption that each object have an Id member.
// If the objectsFile does not exist it will be created on demand.
// Warning: no type and data validation is provided
///////////////////////////////////////////////////////////////////////////
module.exports = 
class Repository {
    constructor(objectsName) {
        this.objectsList = [];
        this.objectsFile = `./data/${objectsName}.json`;
        this.read();
    }
    read() {
        try{
            // Here we use the synchronus version readFile in order  
            // to avoid concurrency problems
            let rawdata = fs.readFileSync(this.objectsFile);
            // we assume here that the json data is formatted correctly
            this.objectsList = JSON.parse(rawdata);
        } catch(error) {
            if (error.code === 'ENOENT') {
                // file does not exist, it will be created on demand
                this.objectsList = [];
            }
        }
    }
    write() {
        // Here we use the synchronous version writeFile in order
        // to avoid concurrency problems  
        fs.writeFileSync(this.objectsFile, JSON.stringify(this.objectsList));
        this.read();
    }
    nextId() {
        let maxId = 0;
        for(let object of this.objectsList){
            if (object.Id > maxId) {
                maxId = object.Id;
            }
        }
        return maxId + 1;
    }
    add(object) {
        try {
            object.Id = this.nextId();
            this.objectsList.push(object);
            this.write();
            return object;
        } catch(error) {
            return null;
        }
    }
    addBookmark(object) {
        if (!this.validateObjectFormat(object)) return null;
        if (this.isDuplicate(object)) return null;
        try {
            object.Id = this.nextId();
            this.objectsList.push(object);
            this.write();
            return object;
        } catch(error) {
            return null;
        }
    }
    getAll() {
        return this.objectsList;
    }
    get(id){
        for(let object of this.objectsList){
            if (object.Id === id) {
               return object;
            }
        }
        return null;
    }
    remove(id) {
        let index = 0;
        for(let object of this.objectsList){
            if (object.Id === id) {
                this.objectsList.splice(index,1);
                this.write();
                return true;
            }
            index ++;
        }
        return false;
    }
    update(objectToModify) {
        let index = 0;
        for(let object of this.objectsList){
            if (object.Id === objectToModify.Id) {
                this.objectsList[index] = objectToModify;
                this.write();
                return true;
            }
            index ++;
        }
        return false;
    }
    updateBookmark(objectToModify) {
        if (!this.validateObjectFormat(objectToModify)) return null;
        if (this.isDuplicate(objectToModify)) return null;
        let index = 0;
        for(let object of this.objectsList){
            if (object.Id === objectToModify.Id) {
                this.objectsList[index] = objectToModify;
                this.write();
                return true;
            }
            index ++;
        }
        return false;
    }

    //Valide le format de l'objet Bookmark de la façon suivante (malgré la validation JS de l'interface au cas où JS soit désactivé ou un POST vienne de postman): 
    //  1. Si une des champs est manquant, l'objet est erroné et la fonction retourne faux
    //  2. Si les trois champs sont présents mais qu'un ou plusieurs est vide, l'objet est erroné et la fonction retourne faux
    //  3. Si il y a des propriétés de trop (autres que Url, Name, Category), l'objet est erroné et la fonction retourne faux

    validateObjectFormat(object){
        const validFields = ["Category", "Name", "Url", "Id"];
        if (object.Category == undefined || object.Name == undefined || object.Url == undefined) return false;
        let validObject = true;
        for (const property in object){
            if (typeof(object[property]) == "string"){
                if (object[property].trim() == "")
                validObject = false;
                if (!validFields.includes(property))
                    validObject = false;
            }
        }   
        return validObject;
    }

    //Parcours la liste des objets (bookmarks) et compare les propriétés du nouveau bookmark qu'on tente d'ajouter avec les bookmarks existants
    //Si un bookmark existant a les 3 propriétés identiques au nouveau bookmark, c'est un doublon, donc il n'est pas ajouté.
    isDuplicate(object){
        if (this.objectsList.some(e => e.Name.trim().toLowerCase() === object.Name.trim().toLowerCase() 
                                  && e.Url.trim().toLowerCase() === object.Url.trim().toLowerCase()
                                  && e.Category.trim().toLowerCase() === object.Category.trim().toLowerCase())){
                                    return true;
                                  }
        return false;
    }


    sortName(){ //Retourne la liste des objects en ordre alphabétique
       let table = this.objectsList.sort((a, b) => (a.Name > b.Name) ? 1 : (a.Name === b.Name) ? ((a.sortCategorie > b.sortCategorie) ? 1 : -1) : -1 );
        return table;
    }

    sortCategory(){ //Retourne la liste des objects en ordre alphabétique
        let table = this.objectsList.sort((a, b) => (a.sortCategorie > b.sortCategorie) ? 1 : (a.sortCategorie === b.sortCategorie) ? ((a.Name > b.Name) ? 1 : -1) : -1 )
         return table;
    }
    searchCategory(theCategory){
        let table = [];

        for(let object of this.objectsList){
            if(object.Category == theCategory)
                table.push(object);
        }

        return table;
    }

    searchSpecificName(name){
        let table = [];

        for(let object of this.objectsList){
            if(object.Name.toLowerCase() == name)
                table.push(object);
        }

        return table;
    }

    searchNameBySpecificStart(char){
        let table = [];
        let theChar = char.slice(0,-1);
        for(let object of this.objectsList){
            let name = object.Name.toLowerCase();
            if(name.indexOf(theChar) === 0)
                table.push(object);
        }

        return table;
    }

    options(){
        return [
            {"Action":"GET","Service":"/api/bookmarks"},
            {"Action":"GET","Service":"/api/bookmarks?sort=name"},
            {"Action":"GET","Service":"/api/bookmarks?sort=category"},
            {"Action":"GET","Service":"/api/bookmarks/id"},
            {"Action":"GET","Service":"/api/bookmarks?name=nom"},
            {"Action":"GET","Service":"/api/bookmarks?name=ab*"},
            {"Action":"GET","Service":"/api/bookmarks?category=sport"},
            {"Action":"GET","Service":"/api/bookmarks?"}
        
        ]
    }
}