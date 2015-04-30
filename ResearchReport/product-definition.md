## Product definition

Consider the following user story:

Bob is a professor at the university in Delft specializing in algorithmics. 
Next to his work in this field he also teaches students the fundamentals, theory and science behind algorithms. 
For this reason he often needs to write simple programs to demonstrate these algorithms in class. 
However he found that often there is confusion when explaining code to his students as the code and the execution are disjoint. 
For this reason he wants to be able to go through his code in a step by step manner and display the effects of each step.

Ever been completely lost in the code of someone else? 
Or you wished that someone would have provided you with more information about the functioning, pitfalls and more of the code? 
In many cases you will have to go over each line, think about example executions and consider various cases. 
This process is time consuming and in the end, it is either unsuccessful or finishes often with "Oh, of course! ..... Well I wish somebody had told me sooner".
This scenario can be limited the evolution of projects.

The following application serves as a way to help developers illustrate their projects in a more comprehensive and 
detailed manner.

For convenience and clarity we will call the developer who wants to illustrate his project and or code the Writer and 
the user who would want to see the explenation we will call the Viewer

With the aid of this application, a developer which we will call the Writer can create a narrative for his or her project.
Borrowed from the actual definition of the word: in short a narrative is a sequence of connected events, presented in a sequence of written words, and/or in a sequence of (moving) pictures.
The writer can create these narratives by adding elements called narrative primitives to a part of a project. 
An example of a narrative primitive could be a textual explenation, an illustrative image or a video presentation. 
On top of this, parts of the code itself can be narrated in this manner.
The Writer can select a step in the code provide it with some explenation in the form of these narrative primitives.
Much like a debugger, the Viewer can then go through the code in a step by step manner. 
However this time the Writer can not only use text or images but can also access the variables in the code to provide the Viewer
with an animation based on the state of the variables during execution.

The Writer can make multiple narratives for his project and can decide for himself or herself on what level of abstraction. 
Lastly a Writer can link from within a narrative to another narrative which allows for reusability.


##Glossary

Here are some definitions used throughout the document:
* **AST**: Abstract syntax tree. A tree that represents the parsed code.
* **File/Folder tree**. Basic file and folder structure
* **CAST**: Context abstract syntax tree. Combination of File/Folder & AST tree.
* Tree View: A tree representation of the CAST. A CAST node selection is the same for tree View <-> project & text View
* **Narrative**: A Sequence of Narative Primitives attached to a node in the CAST.
* **Code Narrative**: A Narrative that is located in an AST node. 
  * Has access to the scope
  * Final Narrative Primitive is the next narrative node reached by execution.
* **Narrative Primitives**: A step/element in a Narrative that user can step through. 
  * Text
  * Video 
  * Image
  * Link to a narrative
  * Visualization call
* **Visualization**: Object with functions to animate/update a graphic. examples: Graph, table , pie-chart.
* **Narrative graph**: A visual representation of related Naratives. 
* **Viewer**: A person that follows Narratives or selects a CAST Node to gain more insight about that node.
* **Writer**: A person that writes Narratives for nodes attached to the CAST.
