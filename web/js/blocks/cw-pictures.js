/*
 * Copyright 2016 The CodeWorld Authors. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

goog.provide('Blockly.Blocks.cwPictures');

goog.require('Blockly.Blocks');

var picsHUE = 160;
Blockly.Blocks['cwCombine'] = {
  init: function() {
    this.appendValueInput('PIC0');
    this.appendValueInput('PIC1')
        .appendField(new Blockly.FieldLabel("&","blocklyTextEmph") );
    this.setColour(picsHUE);
    this.setMutator(new Blockly.Mutator(['pics_combine_ele']));
    this.setTooltip('Combine multiple pictures');
    this.itemCount_ = 2;
    this.setOutput(true);

    Blockly.TypeInf.defineFunction("&", Type.fromList([Type.Lit("Picture"),Type.Lit("Picture"),Type.Lit("Picture")]));
    this.setAsFunction("&");
  },
  
  foldr1 : function(fn, xs) {
    var result = xs[xs.length - 1];
      for (var i = xs.length - 2; i > -1; i--) {
        result = fn(xs[i], result);
      }
    return result;
  },

  getExpr: function(){
    var exps = [];
    this.inputList.forEach(function(inp){
      if(inp.connection.isConnected())
        exps.push(inp.connection.targetBlock().getExpr());
      else
        exps.push(Exp.Var('undef'));
    });
    var func = (a,b) => Exp.AppFunc([a,b],Exp.Var("&"));
    var e = this.foldr1(func,exps);
    return e;
  },


  decompose: function(workspace) {
    var containerBlock =
        workspace.newBlock('pics_combine_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;

    for (var x = 0; x < this.itemCount_; x++) {
      var itemBlock = workspace.newBlock('pics_combine_ele');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }

    return containerBlock;
  },

  compose: function(containerBlock) {
    var tps = [];
    
    for (var x = 0; x < this.itemCount_; x++) {
      this.removeInput('PIC' + x);
    }

    this.itemCount_ = 0;
    // Rebuild the block's inputs.
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    while (itemBlock) {
      var input = this.appendValueInput('PIC' + this.itemCount_);
      tps.push(Type.Lit("Picture"));
      if (this.itemCount_ > 0) {
        input.appendField(new Blockly.FieldLabel("&","blocklyTextEmph") );
      }
      if (itemBlock.valueConnection_) {
        input.connection.connect(itemBlock.valueConnection_);
      }
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
      this.itemCount_++;
    }
    tps.push(Type.Lit("Picture"));
    this.arrows = Type.fromList(tps);
    this.initArrows();
    this.renderMoveConnections_();
  },

  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },

  domToMutation: function(xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    var tps = [];
    this.inputList = [];
    for (var i = 0; i < this.itemCount_; i++){
      var input = this.appendValueInput('PIC' + i);
      tps.push(Type.Lit("Picture"));
      if (i > 0) {
        input.appendField(new Blockly.FieldLabel("&","blocklyTextEmph") );
      }
    };
    tps.push(Type.Lit("Picture"));
    this.arrows = Type.fromList(tps);
    this.initArrows();

  }
};

Blockly.Blocks['pics_combine_ele'] = {
  /**
   * Mutator block for procedure argument.
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput()
        .appendField('picture');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(picsHUE);
    this.setTooltip('Adds a picture input');
    this.contextMenu = false;
  },
  getExpr: null
};

Blockly.Blocks['pics_combine_container'] = {
  init: function() {
    this.setColour(picsHUE);
    this.appendDummyInput()
        .appendField('Picture inputs');
    this.appendStatementInput('STACK');
    this.setTooltip('A list of inputs that the combine block should have');
    this.contextMenu = false;
  },
  getExpr: null
};

Blockly.Blocks['lists_path'] = {
  init: function() {
    this.setColour(160);
    this.appendValueInput('LST')
        .appendField(new Blockly.FieldLabel("path","blocklyTextEmph") );
    this.setOutput(true);
    var pair = Type.Lit("pair", [Type.Lit("Number"), Type.Lit("Number")]);
    Blockly.TypeInf.defineFunction("path", Type.fromList([Type.Lit("list", [pair]), Type.Lit("Picture")]));
    this.setAsFunction("path");
  }
};


