'use strict';
var Narrative = function (name, CASTNode) {
	this.name = name;
	this.CASTNode = CASTNode;
};

Narrative.prototype = {
	getType : function () {
		if (this instanceof FSNarrative) {
			return 'fs_narrative';
		} else if (this instanceof CodeNarrative) {
			return 'code_narrative';
		}
		throw 'BadNarrativeTypeError';
	},
	isCodeNarrative : function () {
		return this.getType() === 'code_narrative';
	},
	isFSNarrative : function () {
		return this.getType() === 'fs_narrative';
	},
	removeItem : function (index) {
		if (index instanceof Item) {
			index : this.Items.indexOf(index);
		}
		this.Items.splice(index, 1);
	},
	validItem : function () {
		return false;
	},
	addItem : function (item, index) {
		if (!this.validItem(item)) {
			console.error('Trying to add a wrong type of item', item, this);
			throw 'BadItemForNarrative';
		}
		if (index === undefined) {
			index = this.items.length;
		}
		this.items.splice(index, 0, item);
	},
	addItems : function (items) {
		for (var i in items) {
			this.addItem(Item.prototype.buildNewItem(items[i]));
		}
	}
}



var FSNarrative = function (name, CASTNode, items) {
	if (!(CASTNode.isFile() || CASTNode.isFolder())) {
		console.log(' You can not add a FSNarrative on', CASTNode);
		throw 'BadNarrativeForCASTNode';
	}
	Narrative.call(this, name, CASTNode);
	this.items = [];
	this.addItems(items);
};

FSNarrative.prototype = Object.create(Narrative.prototype);
FSNarrative.prototype.validItem = function (item) {
		return item instanceof Item;
	};



//items is an array that contains objects {'node' , 'items'}
// the goal is to append to the subnodes of the AST nodes the proper items under the proper name
var CodeNarrative = function (name, CASTNode, items) {
	if (!CASTNode.isASTNode()) {
		console.log(' You can not add a CodeNarrative on', CASTNode);
		throw 'BadNarrativeForCASTNode';
	}
	Narrative.call(this, CASTNode);
	
	this.items = [];
};


CodeNarrative.prototype = Object.create(Narrative.prototype);
CodeNarrative.prototype.validItem = function (item) {
		if (item instanceof LinkItem) {
			return false;
		}
		return item instanceof Item;
	};