export interface Note{
    msg?: String,
    noteId: String,
    userId: String,
    content: String,
    description: String,
    name: String,
    topic: String,
    dateCreate?: Date,
    dateModified?: Date,
    dateCreatString: String,
    dateModifiedString: String
}