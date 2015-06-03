'use strict';

var CASTNode = function(name, parent, children) {
    this.name = name;
    this.parent = parent;
    this.children = children || {};
    this.narratives = [];
    this.path = null;
};
CASTNode.prototype = {
    getPath: function() {
        if (this.path === null) {
            this.path = this.getParent().getPath() + '/' + this.name;
        }
        return this.path
    },
    getParent: function() {
        return this.parent;
    },
    getNode: function(path) {
        //ensure path is a array
        if (typeof path === 'string') {
            path = path.split('/');
        }
        //filter empty and '.' directories
        var directChild;
        do {
            directChild = path.shift();
        } while (directChild === '' || directChild === '.');
        if (!path || path.length == 0) {
            return this.getChild(directChild) || this;
        }
        return this.getChild(directChild).getNode(path);
    },
    getChild: function(name) {
        
        return this.children[name];
    },
    getChildren: function() {
        return this.children;
    },
    isFolder: function() {
        return this instanceof FolderNode
    },
    isFile: function() {
        return this instanceof FileNode
    },
    isASTNode: function() {
        return this instanceof ASTNode
    },
    isRootNode: function(){
        return this instanceof RootNode
    },
    isJSFile:function(){
        return this.name.substr(-3) === '.js';
    }
};

var RootNode = function(name,children) {
    CASTNode.call(this, name, null, children);
    this.path = '';
};
RootNode.prototype = Object.create(CASTNode.prototype);

var FolderNode = function(name, parent, children) {
    CASTNode.call(this, name, parent, children);
};
FolderNode.prototype = Object.create(CASTNode.prototype);
var FileNode = function(name, parent, children, content) {
    CASTNode.call(this, name, parent, children);
    this.content = content;
};
FileNode.prototype = Object.create(CASTNode.prototype);



//return filenode child. only parseAs for the moment is 'program';
FileNode.prototype.getChild = function(parseAs) {
    var children = this.getChildren();
    if (!children[parseAs]) {
        if (parseAs === 'Program') {
            if (this.name.substr(-3) === ".js") { //If it is a json file, add it's AST to the cast
                var AST = acorn.parse(this.content, {
                    locations: true
                });
                this.children.Program = wrapAcornAsASTNode(AST, 'Program',this);
            }

        }
    }

    return children[parseAs];
}


var t_node_constructor = acorn.parse('1').constructor;
Object.defineProperty(t_node_constructor,'ASTNode',{
    'enumerable': false
})

//ASTNodes are a wrapper arround the parse tree that acorn generates

var ASTNode = function (name,parent,children,tnode) {
    CASTNode.call(this, name , parent, children);
    this.tnode = tnode;
};
ASTNode.prototype = Object.create(CASTNode.prototype);
ASTNode.prototype.containsPosition = function(pos){
    var tnode = this.tnode;
    if(tnode instanceof Array){
        tnode = this.parent.tnode;
    }
    return (tnode.start <= pos && tnode.end >= pos)

}

// Attach items to the interpreter ast nodes, under the attribute .codeNarrative[ narrative name ]
ASTNode.prototype.attachItemHooks = function(codeNarrative){

        var hooks = codeNarrative.itemHooks
        var node;
        for(var i in hooks){
            node = this.getNode(hooks[i].node);
            node.tnode.codeNarrative = node.tnode.codeNarrative || {};
            node.tnode.codeNarrative[codeNarrative.name] = [];
            for(var j in hooks[i].items){
                var item = Item.prototype.buildItem(hooks[i].items[j]);
                node.tnode.codeNarrative[codeNarrative.name].push( item );
            }
        }
}



function wrapAcornAsASTNode(tnode,name,parent){

    var children = {}
    var newASTNode = new ASTNode(name,parent,children,tnode);
    tnode.ASTNode = newASTNode;

    for(var index in tnode){
        var subNode = tnode[index];
        if( subNode instanceof t_node_constructor || subNode instanceof Array ){
            var name = index;
            if(subNode.name && subNode.type){
                name += '_' + subNode.type;
            }
            name = name.split('Statement').join('');

            var child = wrapAcornAsASTNode( subNode, name , newASTNode);
            if(children[name]){
                throw new Error('Wohoooaaah , same cast paths',children[name],child)
            }
            children[name] = child; 
        }
    }
    return newASTNode;

}
