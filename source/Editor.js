/*jshint strict:false, undef:false, unused:false */

var instances = [];

function getSquireInstance ( doc ) {
    var l = instances.length,
        instance;
    while ( l-- ) {
        instance = instances[l];
        if ( instance._doc === doc ) {
            return instance;
        }
    }
    return null;
}

function mergeObjects ( base, extras, mayOverride ) {
    var prop, value;
    if ( !base ) {
        base = {};
    }
    if ( extras ) {
        for ( prop in extras ) {
            if ( mayOverride || !( prop in base ) ) {
                value = extras[ prop ];
                base[ prop ] = ( value && value.constructor === Object ) ?
                    mergeObjects( base[ prop ], value, mayOverride ) :
                    value;
            }
        }
    }
    return base;
}

function Squire ( root, config ) {
  if ( root.nodeType === DOCUMENT_NODE ) {
        root = root.body;
    }
    var doc = root.ownerDocument;
    var win = doc.defaultView;
    var mutation;

    this._win = win;
    this._doc = doc;
    this._root = root;

    this._events = {};

    this._isFocused = false;
    this._lastSelection = null;

    // IE loses selection state of iframe on blur, so make sure we
    // cache it just before it loses focus.
    if ( losesSelectionOnBlur ) {
        this.addEventListener( 'beforedeactivate', this.getSelection );
    }

    // The keypress event listener is useful since it doesn't fire for
    // arrow or modifier keys, whereas keydown fires for everything.
    // Currently this get fired after the onkey handler in keyhandlers,
    // so there might have already been some processing on the range
    // before arriving here.
    this.addEventListener("keypress", function(e){
        var r = this.getSelection()
        var sc = r.startContainer
        var so = r.startOffset
        var child = sc.childNodes && sc.childNodes[so]
        var previous
        var root = this._root

        if(notEditable(child)){
            console.info("NOT EDITABLE need to move range")
            ensureOutsideOfNotEditable( this )
            r = this.getSelection()
            sc = r.startContainer
            so = r.startOffset
            child = sc.childNodes && sc.childNodes[so]
            if(notEditable(child)){
              var previousSibling = child.previousSibling
              if(isText(previousSibling)){
                  var length = previousSibling.length
                  this.setSelectionToNode(previousSibling, length ? length : 0)
              }
              else{
                  console.info("Previous sibling not text node, creating text node")
                  e.preventDefault()
                  var tn = this._doc.createTextNode(String.fromCharCode(e.charCode))
                  sc.insertBefore(tn, child)
                  this.setSelectionToNode(tn, 1)
              }
            }
        }

        if(sc.nodeType === TEXT_NODE){
          if(so === 0){
            previous = findPreviousTextOrNotEditable(root, sc)
            if(notEditable(previous, root)){
              // TODO: nate: could possibly just insert the char here
              sc.insertData(0, ZWS)
              r.setStart(sc, 1)
              this.setSelection(r)
            }
          }
        }
        else{
          console.info("NOT TEXT NODE")
          previous = findPreviousTextOrNotEditable(root, child)
          if(notEditable(previous, root)){
            console.info("prev not edit")
            // TODO: nate: could possibly just insert the char here
            var node = this._doc.createTextNode(ZWS)
            sc.insertBefore(node, child)
            r.setStart(node, 1)
            // r.setEnd(node, 1)
            this.setSelection(r)
            // mergeInlines(node.parentNode, range)
          }
        }
    });

    this._hasZWS = false;

    this._lastAnchorNode = null;
    this._lastFocusNode = null;
    this._path = '';
    this._willUpdatePath = false;

    // NATE: We are resorting to the old way of handling changes since we need to move out of noteditable nodes.
    // To do this with the 'selectionchange' event is trickier since our current procedure triggers a selection change
    // nodes.  To do this with the 'selectionchange' event is trickier since our current procedure triggers
    // a selection change
    // if ( 'onselectionchange' in doc ) {
    //   this.addEventListener( 'selectionchange', this._updatePathOnEvent );
    // } else {
      this.addEventListener( 'keyup', this._updatePathOnEvent );
      this.addEventListener( 'mouseup', this._updatePathOnEvent );
      this._selectionClick = false
      this.addEventListener('mousedown', function (e) {
        var range = this.getSelection()
        this._selectionClick = !range.collapsed
      })
      this.addEventListener( 'mouseup', function(){
          var docSelection = this._doc.getSelection()
          var range = docSelection && docSelection.getRangeAt(0)
          moveRangeOutOfNotEditable(range)
          // Only set selection in the editor if there was no selection on click; otherwise, it will clear.
          if(!this._selectionClick){
            this.setSelection(range)
          }
          this._selectionClick = false
      } );
    // }

    this._undoIndex = -1;
    this._undoStack = [];
    this._undoStackLength = 0;
    this._isInUndoState = false;
    this._ignoreChange = false;
    this._ignoreAllChanges = false;

    if ( canObserveMutations ) {
        mutation = new MutationObserver( this._docWasChanged.bind( this ) );
        mutation.observe( root, {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true
        });
        this._mutation = mutation;
    } else {
        this.addEventListener( 'keyup', this._keyUpDetectChange );
    }

    // On blur, restore focus except if the user taps or clicks to focus a
    // specific point. Can't actually use click event because focus happens
    // before click, so use mousedown/touchstart
    this._restoreSelection = false;
    this.addEventListener( 'blur', enableRestoreSelection );
    this.addEventListener( 'mousedown', disableRestoreSelection );
    this.addEventListener( 'touchstart', disableRestoreSelection );
    this.addEventListener( 'focus', restoreSelection );

    // IE sometimes fires the beforepaste event twice; make sure it is not run
    // again before our after paste function is called.
    this._awaitingPaste = false;
    this.addEventListener( isIElt11 ? 'beforecut' : 'cut', onCut );
    this.addEventListener( 'copy', onCopy );
    // NATE: we are implementing paste in the main app.
    // this.addEventListener( isIElt11 ? 'beforepaste' : 'paste', onPaste );
    this.addEventListener( 'drop', onDrop );

    // Opera does not fire keydown repeatedly.
    this.addEventListener( isPresto ? 'keypress' : 'keydown', onKey );

    // Add key handlers
    this._keyHandlers = Object.create( keyHandlers );

    // Override default properties
    this.setConfig( config );

    // Fix IE<10's buggy implementation of Text#splitText.
    // If the split is at the end of the node, it doesn't insert the newly split
    // node into the document, and sets its value to undefined rather than ''.
    // And even if the split is not at the end, the original node is removed
    // from the document and replaced by another, rather than just having its
    // data shortened.
    // We used to feature test for this, but then found the feature test would
    // sometimes pass, but later on the buggy behaviour would still appear.
    // I think IE10 does not have the same bug, but it doesn't hurt to replace
    // its native fn too and then we don't need yet another UA category.
    if ( isIElt11 ) {
        win.Text.prototype.splitText = function ( offset ) {
            var afterSplit = this.ownerDocument.createTextNode(
                    this.data.slice( offset ) ),
                next = this.nextSibling,
                parent = this.parentNode,
                toDelete = this.length - offset;
            if ( next ) {
                parent.insertBefore( afterSplit, next );
            } else {
                parent.appendChild( afterSplit );
            }
            if ( toDelete ) {
                this.deleteData( offset, toDelete );
            }
            return afterSplit;
        };
    }

    root.setAttribute( 'contenteditable', 'true' );

    // Remove Firefox's built-in controls
    try {
        doc.execCommand( 'enableObjectResizing', false, 'false' );
        doc.execCommand( 'enableInlineTableEditing', false, 'false' );
    } catch ( error ) {}

    instances.push( this );

    // Need to register instance before calling setHTML, so that the fixCursor
    // function can lookup any default block tag options set.
    this.setHTML( '' );
}

var proto = Squire.prototype;

proto.setConfig = function ( config ) {
    config = mergeObjects({
        blockTag: 'DIV',
        blockAttributes: null,
        tagAttributes: {
            blockquote: null,
            ul: null,
            ol: null,
            li: null,
            a: null
        },
        undo: {
            documentSizeThreshold: -1, // -1 means no threshold
            undoLimit: -1 // -1 means no limit
        }
    }, config, true );

    // Users may specify block tag in lower case
    config.blockTag = config.blockTag.toUpperCase();

    this._config = config;

    return this;
};

proto.createElement = function ( tag, props, children ) {
    return createElement( this._doc, tag, props, children );
};

proto.createDefaultBlock = function ( children ) {
    var config = this._config;
    return fixCursor(
        this.createElement( config.blockTag, config.blockAttributes, children ),
        this._root
    );
};

proto.didError = function ( error ) {
    console.error( error );
};

proto.getDocument = function () {
    return this._doc;
};
proto.getRoot = function () {
    return this._root;
};

proto.modifyDocument = function ( modificationCallback ) {
    this._ignoreAllChanges = true;
    if ( this._mutation ) {
        this._mutation.disconnect();
    }

    modificationCallback();

    this._ignoreAllChanges = false;
    if ( this._mutation ) {
        this._mutation.observe( this._root, {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true
        });
    }
};

// --- Events ---

// Subscribing to these events won't automatically add a listener to the
// document node, since these events are fired in a custom manner by the
// editor code.
var customEvents = {
    pathChange: 1, select: 1, input: 1, undoStateChange: 1
};

proto.fireEvent = function ( type, event ) {
    var handlers = this._events[ type ];
    var isFocused, l, obj;
    // UI code, especially modal views, may be monitoring for focus events and
    // immediately removing focus. In certain conditions, this can cause the
    // focus event to fire after the blur event, which can cause an infinite
    // loop. So we detect whether we're actually focused/blurred before firing.
    if ( /^(?:focus|blur)/.test( type ) ) {
        isFocused = isOrContains( this._root, this._doc.activeElement );
        if ( type === 'focus' ) {
            if ( !isFocused || this._isFocused ) {
                return this;
            }
            this._isFocused = true;
        } else {
            if ( isFocused || !this._isFocused ) {
                return this;
            }
            this._isFocused = false;
        }
    }
    if ( handlers ) {
        if ( !event ) {
            event = {};
        }
        if ( event.type !== type ) {
            event.type = type;
        }
        // Clone handlers array, so any handlers added/removed do not affect it.
        handlers = handlers.slice();
        l = handlers.length;
        while ( l-- ) {
            obj = handlers[l];
            try {
                if ( obj.handleEvent ) {
                    obj.handleEvent( event );
                } else {
                    obj.call( this, event );
                }
            } catch ( error ) {
                error.details = 'Squire: fireEvent error. Event type: ' + type;
                this.didError( error );
            }
        }
    }
    return this;
};

proto.destroy = function () {
    var l = instances.length;
    var events = this._events;
    var type;

    for ( type in events ) {
        this.removeEventListener( type );
    }
    if ( this._mutation ) {
        this._mutation.disconnect();
    }
    while ( l-- ) {
        if ( instances[l] === this ) {
            instances.splice( l, 1 );
        }
    }

    // Destroy undo stack
    this._undoIndex = -1;
    this._undoStack = [];
    this._undoStackLength = 0;
};

proto.handleEvent = function ( event ) {
    this.fireEvent( event.type, event );
};

proto.addEventListener = function ( type, fn ) {
    var handlers = this._events[ type ];
    var target = this._root;
    if ( !fn ) {
        this.didError({
            name: 'Squire: addEventListener with null or undefined fn',
            message: 'Event type: ' + type
        });
        return this;
    }
    if ( !handlers ) {
        handlers = this._events[ type ] = [];
        if ( !customEvents[ type ] ) {
            if ( type === 'selectionchange' ) {
                target = this._doc;
            }
            target.addEventListener( type, this, true );
        }
    }
    handlers.push( fn );
    return this;
};

proto.removeEventListener = function ( type, fn ) {
    var handlers = this._events[ type ];
    var target = this._root;
    var l;
    if ( handlers ) {
        if ( fn ) {
            l = handlers.length;
            while ( l-- ) {
                if ( handlers[l] === fn ) {
                    handlers.splice( l, 1 );
                }
            }
        } else {
            handlers.length = 0;
        }
        if ( !handlers.length ) {
            delete this._events[ type ];
            if ( !customEvents[ type ] ) {
                if ( type === 'selectionchange' ) {
                    target = this._doc;
                }
                target.removeEventListener( type, this, true );
            }
        }
    }
    return this;
};

// --- Selection and Path ---

proto._createRange =
        function ( range, startOffset, endContainer, endOffset ) {
    if ( range instanceof this._win.Range ) {
        return range.cloneRange();
    }
    var domRange = this._doc.createRange();
    domRange.setStart( range, startOffset );
    if ( endContainer ) {
        domRange.setEnd( endContainer, endOffset );
    } else {
        domRange.setEnd( range, startOffset );
    }
    return domRange;
};

proto.getCursorPosition = function ( range ) {
    if ( ( !range && !( range = this.getSelection() ) ) ||
            !range.getBoundingClientRect ) {
        return null;
    }
    // Get the bounding rect
    var rect = range.getBoundingClientRect();
    var node, parent;
    if ( rect && !rect.top ) {
        this._ignoreChange = true;
        node = this._doc.createElement( 'SPAN' );
        node.textContent = ZWS;
        this.insertNodeInRange( range, node );
        rect = node.getBoundingClientRect();
        parent = node.parentNode;
        parent.removeChild( node );
        mergeInlines( parent, range );
    }
    return rect;
};

proto._moveCursorTo = function ( toStart ) {
    var root = this._root,
        range = this._createRange( root, toStart ? 0 : root.childNodes.length );
    moveRangeBoundariesDownTree( range );
    this.setSelection( range );
    return this;
};
proto.moveCursorToStart = function () {
    return this._moveCursorTo( true );
};
proto.moveCursorToEnd = function () {
    return this._moveCursorTo( false );
};

var getWindowSelection = function ( self ) {
    return self._win.getSelection() || null;
};

proto.setSelection = function ( range ) {
    if ( range ) {
        this._lastSelection = range;
        // If we're setting selection, that automatically, and synchronously, // triggers a focus event. So just store the selection and mark it as
        // needing restore on focus.
        if ( !this._isFocused ) {
            enableRestoreSelection.call( this );
        } else if ( isAndroid && !this._restoreSelection ) {
            // Android closes the keyboard on removeAllRanges() and doesn't
            // open it again when addRange() is called, sigh.
            // Since Android doesn't trigger a focus event in setSelection(),
            // use a blur/focus dance to work around this by letting the
            // selection be restored on focus.
            // Need to check for !this._restoreSelection to avoid infinite loop
            enableRestoreSelection.call( this );
            this.blur();
            this.focus();
        } else {
            // iOS bug: if you don't focus the iframe before setting the
            // selection, you can end up in a state where you type but the input
            // doesn't get directed into the contenteditable area but is instead
            // lost in a black hole. Very strange.
            if ( isIOS ) {
                this._win.focus();
            }
            var sel = getWindowSelection( this );
            if ( sel ) {
                sel.removeAllRanges();
                sel.addRange( range );
            }
        }
    }
    return this;
};

proto.setSelectionToNode = function (node, startOffset){
    var range = this._doc.createRange()
    range.setStart(node, startOffset)
    range.setEnd(node, startOffset)
    this.setSelection(range)
}

proto.getSelection = function () {
    var sel = getWindowSelection( this );
    var root = this._root;
    var selection, startContainer, endContainer;
    if ( sel && sel.rangeCount ) {
        selection  = sel.getRangeAt( 0 ).cloneRange();
        startContainer = selection.startContainer;
        endContainer = selection.endContainer;
        // FF can return the selection as being inside an <img>. WTF?
        if ( startContainer && isLeaf( startContainer, root ) ) {
            selection.setStartBefore( startContainer );
        }
        if ( endContainer && isLeaf( endContainer, root ) ) {
            selection.setEndBefore( endContainer );
        }

        if (!startContainer.isSameNode(endContainer) && selection.endOffset === 0) {
            selection.setEndBefore(endContainer)
        }
    }
    if ( selection &&
            isOrContains( root, selection.commonAncestorContainer ) ) {
        this._lastSelection = selection;
    } else {
        selection = this._lastSelection;
    }
    if ( !selection ) {
        selection = this._createRange( root.firstChild, 0 );
    }
    return selection;
};

function enableRestoreSelection () {
    this._restoreSelection = true;
}
function disableRestoreSelection () {
    this._restoreSelection = false;
}
function restoreSelection () {
    if ( this._restoreSelection ) {
        this.setSelection( this._lastSelection );
    }
}

proto.getCurrentStartBlock = function() {
  var r = this.getSelection()
  return getStartBlockOfRange(r)
}

proto.getSelectedText = function () {
    var range = this.getSelection(),
        walker = new TreeWalker(
            range.commonAncestorContainer,
            SHOW_TEXT|SHOW_ELEMENT,
            function ( node ) {
                return isNodeContainedInRange( range, node, true );
            }
        ),
        startContainer = range.startContainer,
        endContainer = range.endContainer,
        node = walker.currentNode = startContainer,
        textContent = '',
        addedTextInBlock = false,
        value;

    if ( !walker.filter( node ) ) {
        node = walker.nextNode();
    }

    while ( node ) {
        if ( node.nodeType === TEXT_NODE ) {
            value = node.data;
            if ( value && ( /\S/.test( value ) ) ) {
                if ( node === endContainer ) {
                    value = value.slice( 0, range.endOffset );
                }
                if ( node === startContainer ) {
                    value = value.slice( range.startOffset );
                }
                textContent += value;
                addedTextInBlock = true;
            }
        } else if ( node.nodeName === 'BR' ||
                addedTextInBlock && !isInline( node ) ) {
            textContent += '\n';
            addedTextInBlock = false;
        }
        node = walker.nextNode();
    }

    return textContent;
};

proto.getPath = function () {
    return this._path;
};

// --- Workaround for browsers that can't focus empty text nodes ---

// WebKit bug: https://bugs.webkit.org/show_bug.cgi?id=15256

var removeZWS = function ( root ) {
    var walker = new TreeWalker( root, SHOW_TEXT, function () {
            return true;
        }, false ),
        parent, node, index;
    while ( node = walker.nextNode() ) {
        while ( ( index = node.data.indexOf( ZWS ) ) > -1 ) {
            if ( node.length === 1 ) {
                do {
                    parent = node.parentNode;
                    parent.removeChild( node );
                    node = parent;
                    walker.currentNode = parent;
                } while ( isInline( node ) && !getLength( node ) );
                break;
            } else {
                node.deleteData( index, 1 );
            }
        }
    }
};

proto._didAddZWS = function () {
    this._hasZWS = true;
};
proto._removeZWS = function () {
    if ( !this._hasZWS ) {
        return;
    }
    removeZWS( this._root );
    this._hasZWS = false;
};

// --- Path change events ---

proto._updatePath = function ( range, force ) {
    var anchor = range.startContainer,
        focus = range.endContainer,
        newPath;
    if ( force || anchor !== this._lastAnchorNode ||
            focus !== this._lastFocusNode ) {
        this._lastAnchorNode = anchor;
        this._lastFocusNode = focus;
        newPath = ( anchor && focus ) ? ( anchor === focus ) ?
            getPath( focus, this._root ) : '(selection)' : '';
        if ( this._path !== newPath ) {
            this._path = newPath;
            this.fireEvent( 'pathChange', { path: newPath } );
        }
    }
    if ( !range.collapsed ) {
        this.fireEvent( 'select' );
    }
};

// selectionchange is fired synchronously in IE when removing current selection
// and when setting new selection; keyup/mouseup may have processing we want
// to do first. Either way, send to next event loop.
proto._updatePathOnEvent = function () {
    var self = this;
    if ( !self._willUpdatePath ) {
        self._willUpdatePath = true;
        setTimeout( function () {
            self._willUpdatePath = false;
            self._updatePath( self.getSelection() );
        }, 0 );
    }
};

// --- Focus ---

proto.focus = function () {
    this._root.focus();
    return this;
};

proto.blur = function () {
    this._root.blur();
    return this;
};

// --- Bookmarking ---

var startSelectionId = 'squire-selection-start';
var endSelectionId = 'squire-selection-end';

proto._saveRangeToBookmark = function ( range ) {
    var startNode = this.createElement( 'INPUT', {
            id: startSelectionId,
            type: 'hidden'
        }),
    endNode = this.createElement( 'INPUT', {
            id: endSelectionId,
            type: 'hidden'

        }),
        temp;

    this.insertNodeInRange( range, startNode );
    range.collapse( false );
    this.insertNodeInRange( range, endNode );

    // In a collapsed range, the start is sometimes inserted after the end!
    if ( startNode.compareDocumentPosition( endNode ) &
            DOCUMENT_POSITION_PRECEDING ) {
        startNode.id = endSelectionId;
        endNode.id = startSelectionId;
        temp = startNode;
        startNode = endNode;
        endNode = temp;
    }

    range.setStartAfter( startNode );
    range.setEndBefore( endNode );
};

proto._getRangeAndRemoveBookmark = function ( range ) {
    var root = this._root,
        start = root.querySelector( '#' + startSelectionId ),
        end = root.querySelector( '#' + endSelectionId );

    if ( start && end ) {
        var startContainer = start.parentNode,
            endContainer = end.parentNode,
            startOffset = indexOf.call( startContainer.childNodes, start ),
            endOffset = indexOf.call( endContainer.childNodes, end );

        if ( startContainer === endContainer ) {
            endOffset -= 1;
        }

        detach( start );
        detach( end );

        if ( !range ) {
            range = this._doc.createRange();
        }
        range.setStart( startContainer, startOffset );
        range.setEnd( endContainer, endOffset );

        // Merge any text nodes we split
        mergeInlines( startContainer, range );
        if ( startContainer !== endContainer ) {
            mergeInlines( endContainer, range );
        }

        // If we didn't split a text node, we should move into any adjacent
        // text node to current selection point
        if ( range.collapsed ) {
            startContainer = range.startContainer;
            if ( startContainer.nodeType === TEXT_NODE ) {
                endContainer = startContainer.childNodes[ range.startOffset ];
                if ( !endContainer || endContainer.nodeType !== TEXT_NODE ) {
                    endContainer =
                        startContainer.childNodes[ range.startOffset - 1 ];
                }
                if ( endContainer && endContainer.nodeType === TEXT_NODE ) {
                    range.setStart( endContainer, 0 );
                    range.collapse( true );
                }
            }
        }
    }

    // TODO: NATE: we might want to move this back into getRangeAndRemoveBookmark.  I need
    // it for backspace to function properly.  I'm not sure why it was removed as it used
    // to be part of this function
    // moveRangeBoundariesDownTree( range );
    return range || null;
};

// --- Undo ---

proto._keyUpDetectChange = function ( event ) {
    var code = event.keyCode;
    // Presume document was changed if:
    // 1. A modifier key (other than shift) wasn't held down
    // 2. The key pressed is not in range 16<=x<=20 (control keys)
    // 3. The key pressed is not in range 33<=x<=45 (navigation keys)
    if ( !event.ctrlKey && !event.metaKey && !event.altKey &&
            ( code < 16 || code > 20 ) &&
            ( code < 33 || code > 45 ) ) {
        this._docWasChanged();
    }
};

proto._docWasChanged = function () {
    if ( this._ignoreAllChanges ) {
        return;
    }

    if ( canObserveMutations && this._ignoreChange ) {
        this._ignoreChange = false;
        return;
    }
    if ( this._isInUndoState ) {
        this._isInUndoState = false;
        this.fireEvent( 'undoStateChange', {
            canUndo: true,
            canRedo: false
        });
    }
    this.fireEvent( 'input' );
};

// Leaves bookmark
proto._recordUndoState = function ( range ) {
    // Don't record if we're already in an undo state
    if ( !this._isInUndoState ) {
        // Advance pointer to new position
        var undoIndex = this._undoIndex += 1;
        var undoStack = this._undoStack;
        var undoConfig = this._config.undo;
        var undoThreshold = undoConfig.documentSizeThreshold;
        var undoLimit = undoConfig.undoLimit;
        var html;

        // Truncate stack if longer (i.e. if has been previously undone)
        if ( undoIndex < this._undoStackLength ) {
            undoStack.length = this._undoStackLength = undoIndex;
        }

        // Get data
        if ( range ) {
            this._saveRangeToBookmark( range );
        }
        html = this._getHTML();

        // If this document is above the configured size threshold,
        // limit the number of saved undo states.
        // Threshold is in bytes, JS uses 2 bytes per character
        if ( undoThreshold > -1 && html.length * 2 > undoThreshold ) {
            if ( undoLimit > -1 && undoIndex > undoLimit ) {
                undoStack.splice( 0, undoIndex - undoLimit );
                undoIndex = this._undoIndex = undoLimit;
                this._undoStackLength = undoLimit;
            }
        }

        // Save data
        undoStack[ undoIndex ] = html;
        this._undoStackLength += 1;
        this._isInUndoState = true;
    }
};

proto.saveUndoState = function ( range ) {
    if ( range === undefined ) {
        range = this.getSelection();
    }
    if ( !this._isInUndoState ) {
        this._recordUndoState( range );
        this._getRangeAndRemoveBookmark( range );
    }
    return this;
};

proto.undo = function () {
    // Sanity check: must not be at beginning of the history stack
    if ( this._undoIndex !== 0 || !this._isInUndoState ) {
        // Make sure any changes since last checkpoint are saved.
        this._recordUndoState( this.getSelection() );

        this._undoIndex -= 1;
        this._setHTML( this._undoStack[ this._undoIndex ] );
        var range = this._getRangeAndRemoveBookmark();
        if ( range ) {
            this.setSelection( range );
        }
        this._isInUndoState = true;
        this.fireEvent( 'undoStateChange', {
            canUndo: this._undoIndex !== 0,
            canRedo: true
        });
        this.fireEvent( 'input' );
    }
    return this;
};

proto.redo = function () {
    // Sanity check: must not be at end of stack and must be in an undo
    // state.
    var undoIndex = this._undoIndex,
        undoStackLength = this._undoStackLength;
    if ( undoIndex + 1 < undoStackLength && this._isInUndoState ) {
        this._undoIndex += 1;
        this._setHTML( this._undoStack[ this._undoIndex ] );
        var range = this._getRangeAndRemoveBookmark();
        if ( range ) {
            this.setSelection( range );
        }
        this.fireEvent( 'undoStateChange', {
            canUndo: true,
            canRedo: undoIndex + 2 < undoStackLength
        });
        this.fireEvent( 'input' );
    }
    return this;
};

// --- Inline formatting ---

// Looks for matching tag and attributes, so won't work
// if <strong> instead of <b> etc.
proto.hasFormat = function ( tag, attributes, range ) {
    // 1. Normalise the arguments and get selection
    tag = tag.toUpperCase();
    if ( !attributes ) { attributes = {}; }
    if ( !range && !( range = this.getSelection() ) ) {
        return false;
    }

    // Sanitize range to prevent weird IE artifacts
    if ( !range.collapsed &&
            range.startContainer.nodeType === TEXT_NODE &&
            range.startOffset === range.startContainer.length &&
            range.startContainer.nextSibling ) {
        range.setStartBefore( range.startContainer.nextSibling );
    }
    if ( !range.collapsed &&
            range.endContainer.nodeType === TEXT_NODE &&
            range.endOffset === 0 &&
            range.endContainer.previousSibling ) {
        range.setEndAfter( range.endContainer.previousSibling );
    }

    // If the common ancestor is inside the tag we require, we definitely
    // have the format.
    var root = this._root;
    var common = range.commonAncestorContainer;
    var walker, node;
    if ( getNearest( common, root, tag, attributes ) ) {
        return true;
    }

    // If common ancestor is a text node and doesn't have the format, we
    // definitely don't have it.
    if ( common.nodeType === TEXT_NODE ) {
        return false;
    }

    // Otherwise, check each text node at least partially contained within
    // the selection and make sure all of them have the format we want.
    walker = new TreeWalker( common, SHOW_TEXT, function ( node ) {
        return isNodeContainedInRange( range, node, true );
    }, false );

    var seenNode = false;
    while ( node = walker.nextNode() ) {
        if ( !getNearest( node, root, tag, attributes ) ) {
            return false;
        }
        seenNode = true;
    }

    return seenNode;
};

// Extracts the font-family and font-size (if any) of the element
// holding the cursor. If there's a selection, returns an empty object.
proto.getFontInfo = function ( range ) {
    var fontInfo = {
        color: undefined,
        backgroundColor: undefined,
        family: undefined,
        size: undefined
    };
    var seenAttributes = 0;
    var element, style, attr;

    if ( !range && !( range = this.getSelection() ) ) {
        return fontInfo;
    }

    element = range.commonAncestorContainer;
    if ( range.collapsed || element.nodeType === TEXT_NODE ) {
        if ( element.nodeType === TEXT_NODE ) {
            element = element.parentNode;
        }
        while ( seenAttributes < 4 && element ) {
            if ( style = element.style ) {
                if ( !fontInfo.color && ( attr = style.color ) ) {
                    fontInfo.color = attr;
                    seenAttributes += 1;
                }
                if ( !fontInfo.backgroundColor &&
                        ( attr = style.backgroundColor ) ) {
                    fontInfo.backgroundColor = attr;
                    seenAttributes += 1;
                }
                if ( !fontInfo.family && ( attr = style.fontFamily ) ) {
                    fontInfo.family = attr;
                    seenAttributes += 1;
                }
                if ( !fontInfo.size && ( attr = style.fontSize ) ) {
                    fontInfo.size = attr;
                    seenAttributes += 1;
                }
            }
            element = element.parentNode;
        }
    }
    return fontInfo;
};

proto._addFormat = function ( tag, attributes, range ) {
    // If the range is collapsed we simply insert the node by wrapping
    // it round the range and focus it.
    var root = this._root;
    var el, walker, startContainer, endContainer, startOffset, endOffset,
        node, needsFormat;

    if ( range.collapsed ) {
        el = fixCursor( this.createElement( tag, attributes ), root );
        this.insertNodeInRange( range, el );
        range.setStart( el.firstChild, el.firstChild.length );
        range.collapse( true );
    }
    // Otherwise we find all the textnodes in the range (splitting
    // partially selected nodes) and if they're not already formatted
    // correctly we wrap them in the appropriate tag.
    else {
        // Create an iterator to walk over all the text nodes under this
        // ancestor which are in the range and not already formatted
        // correctly.
        //
        // In Blink/WebKit, empty blocks may have no text nodes, just a <br>.
        // Therefore we wrap this in the tag as well, as this will then cause it
        // to apply when the user types something in the block, which is
        // presumably what was intended.

        // Nate:  I've tried this out in chrome and firefox and neither seems to need BR tags as children of a format.
        // I have thus removed the inclusion of br nodes in the formatting

        // IMG tags are included because we may want to create a link around them,
        // and adding other styles is harmless.
        walker = new TreeWalker(
            range.commonAncestorContainer,
            SHOW_TEXT|SHOW_ELEMENT,
            function ( node ) {
                return ( node.nodeType === TEXT_NODE ||
                        node.nodeName === 'IMG'
                    ) && isNodeContainedInRange( range, node, true );
            },
            false
        );

        // Start at the beginning node of the range and iterate through
        // all the nodes in the range that need formatting.
        startContainer = range.startContainer;
        startOffset = range.startOffset;
        endContainer = range.endContainer;
        endOffset = range.endOffset;

        // Make sure we start with a valid node.
        walker.currentNode = startContainer;
        if ( !walker.filter( startContainer ) ) {
            startContainer = walker.nextNode();
            startOffset = 0;
        }

        // If there are no interesting nodes in the selection, abort
        if ( !startContainer ) {
            return range;
        }

        do {
            node = walker.currentNode;
            needsFormat = !getNearest( node, root, tag, attributes );
            if ( needsFormat ) {
                // <br> can never be a container node, so must have a text node
                // if node == (end|start)Container
                if ( node === endContainer && node.length > endOffset ) {
                    node.splitText( endOffset );
                }
                if ( node === startContainer && startOffset ) {
                    node = node.splitText( startOffset );
                    if ( endContainer === startContainer ) {
                        endContainer = node;
                        endOffset -= startOffset;
                    }
                    startContainer = node;
                    startOffset = 0;
                }
                el = this.createElement( tag, attributes );
                replaceWith( node, el );
                el.appendChild( node );
            }
        } while ( walker.nextNode() );

        // If we don't finish inside a text node, offset may have changed.
        if ( endContainer.nodeType !== TEXT_NODE ) {
            if ( node.nodeType === TEXT_NODE ) {
                endContainer = node;
                endOffset = node.length;
            } else {
                // If <br>, we must have just wrapped it, so it must have only
                // one child
                endContainer = node.parentNode;
                endOffset = 1;
            }
        }

        // Now set the selection to as it was before
        range = this._createRange(
            startContainer, startOffset, endContainer, endOffset );
    }
    return range;
};

proto._removeFormat = function ( tag, attributes, range, partial ) {
    // Add bookmark
    this._saveRangeToBookmark( range );

    // We need a node in the selection to break the surrounding
    // formatted text.
    var doc = this._doc,
        fixer;
    if ( range.collapsed ) {
        if ( cantFocusEmptyTextNodes ) {
            fixer = doc.createTextNode( ZWS );
            this._didAddZWS();
        } else {
            fixer = doc.createTextNode( '' );
        }
        this.insertNodeInRange( range, fixer );
    }

    // Find block-level ancestor of selection
    var root = range.commonAncestorContainer;
    while ( isInline( root ) ) {
        root = root.parentNode;
    }

    // Find text nodes inside formatTags that are not in selection and
    // add an extra tag with the same formatting.
    var startContainer = range.startContainer,
        startOffset = range.startOffset,
        endContainer = range.endContainer,
        endOffset = range.endOffset,
        toWrap = [],
        examineNode = function ( node, exemplar ) {
            // If the node is completely contained by the range then
            // we're going to remove all formatting so ignore it.
            if ( isNodeContainedInRange( range, node, false ) ) {
                return;
            }

            var isText = ( node.nodeType === TEXT_NODE ),
                child, next;

            // If not at least partially contained, wrap entire contents
            // in a clone of the tag we're removing and we're done.
            if ( !isNodeContainedInRange( range, node, true ) ) {
                // Ignore bookmarks and empty text nodes
                if ( node.nodeName !== 'INPUT' &&
                        ( !isText || node.data ) ) {
                    toWrap.push([ exemplar, node ]);
                }
                return;
            }

            // Split any partially selected text nodes.
            if ( isText ) {
                if ( node === endContainer && endOffset !== node.length ) {
                    toWrap.push([ exemplar, node.splitText( endOffset ) ]);
                }
                if ( node === startContainer && startOffset ) {
                    node.splitText( startOffset );
                    toWrap.push([ exemplar, node ]);
                }
            }
            // If not a text node, recurse onto all children.
            // Beware, the tree may be rewritten with each call
            // to examineNode, hence find the next sibling first.
            else {
                for ( child = node.firstChild; child; child = next ) {
                    next = child.nextSibling;
                    examineNode( child, exemplar );
                }
            }
        },
        formatTags = Array.prototype.filter.call(
            root.getElementsByTagName( tag ), function ( el ) {
                return isNodeContainedInRange( range, el, true ) &&
                    hasTagAttributes( el, tag, attributes );
            }
        );

    if ( !partial ) {
        formatTags.forEach( function ( node ) {
            examineNode( node, node );
        });
    }

    // Now wrap unselected nodes in the tag
    toWrap.forEach( function ( item ) {
        // [ exemplar, node ] tuple
        var el = item[0].cloneNode( false ),
            node = item[1];
        replaceWith( node, el );
        el.appendChild( node );
    });
    // and remove old formatting tags.
    formatTags.forEach( function ( el ) {
        replaceWith( el, empty( el ) );
    });

    // Merge adjacent inlines:
    this._getRangeAndRemoveBookmark( range );
    if ( fixer ) {
        range.collapse( false );
    }
    mergeInlines( root, range );

    return range;
};

proto.changeFormat = function ( add, remove, range, partial ) {
    // Normalise the arguments and get selection
    if ( !range && !( range = this.getSelection() ) ) {
        return this;
    }

    // Save undo checkpoint
    this.saveUndoState( range );

    if ( remove ) {
        range = this._removeFormat( remove.tag.toUpperCase(),
            remove.attributes || {}, range, partial );
    }
    if ( add ) {
        range = this._addFormat( add.tag.toUpperCase(),
            add.attributes || {}, range );
    }

    this.setSelection( range );
    this._updatePath( range, true );

    // We're not still in an undo state
    if ( !canObserveMutations ) {
        this._docWasChanged();
    }

    return this;
};

// --- Block formatting ---
// NATE: I'm not sure why on the mainline squire demo page splitting works properly without this
// modification
var tagAfterSplit = {
    DT:  'DD',
    DD:  'DT',
    LI:  'LI',
    H1:  'H1',
    H2:  'H2',
    H3:  'H3',
    H4:  'H4',
    H5:  'H5',
    H6:  'H6'
};

var splitBlock = function ( self, block, node, offset ) {
    var splitTag = tagAfterSplit[ block.nodeName ],
        splitProperties = null,
        nodeAfterSplit = split( node, offset, block.parentNode, self._root ),
        config = self._config;

    if ( !splitTag ) {
        splitTag = config.blockTag;
        splitProperties = config.blockAttributes;
    }

    // Make sure the new node is the correct type.
    if ( !hasTagAttributes( nodeAfterSplit, splitTag, splitProperties ) ) {
        block = createElement( nodeAfterSplit.ownerDocument,
            splitTag, splitProperties );
        if ( nodeAfterSplit.dir ) {
            block.dir = nodeAfterSplit.dir;
        }
        replaceWith( nodeAfterSplit, block );
        block.appendChild( empty( nodeAfterSplit ) );
        nodeAfterSplit = block;
    }
    return nodeAfterSplit;
};

proto.splitBlockAtCursor = function () {
  var block, node, offset, range
  range = this.getSelection()
  if(!range){
    console.warn("invalid cursor position in splitBlockAtCursor")
  }
  node = range.startContainer
  split ( node, range.startOffset, this._root, this._root )
};

proto.forEachBlock = function ( fn, mutates, range ) {
    if ( !range && !( range = this.getSelection() ) ) {
        return this;
    }

    // Save undo checkpoint
    if ( mutates ) {
        this.saveUndoState( range );
    }

    var root = this._root;
    var start = getStartBlockOfRange( range, root );
    var end = getEndBlockOfRange( range, root );
    if ( start && end ) {
        do {
            if ( fn( start ) || start === end ) { break; }
        } while ( start = getNextBlock( start, root ) );
    }

    if ( mutates ) {
        this.setSelection( range );

        // Path may have changed
        this._updatePath( range, true );

        // We're not still in an undo state
        if ( !canObserveMutations ) {
            this._docWasChanged();
        }
    }
    return this;
};

proto.modifyBlocks = function ( modify, range ) {
    if ( !range && !( range = this.getSelection() ) ) {
        return this;
    }

    // 1. Save undo checkpoint and bookmark selection
    if ( this._isInUndoState ) {
        this._saveRangeToBookmark( range );
    } else {
        this._recordUndoState( range );
    }

    var root = this._root;
    var frag;

    // 2. Expand range to block boundaries
    expandRangeToBlockBoundaries( range, root );
    // 3. Remove range.
    moveRangeBoundariesUpTree( range, root );
    frag = extractContentsOfRange( range, root, root, {fixCursor: false} );

    // 4. Modify tree of fragment and reinsert.
    this.insertNodeInRange( range, modify.call( this, frag ) );
    // return

    // 5. Merge containers at edges
    if ( range.endOffset < range.endContainer.childNodes.length ) {
        mergeContainers( range.endContainer.childNodes[ range.endOffset ], root );
    }
    mergeContainers( range.startContainer.childNodes[ range.startOffset ], root );

    // 6. Restore selection
    this._getRangeAndRemoveBookmark( range );
    this.setSelection( range );
    this._updatePath( range, true );

    // 7. We're not still in an undo state
    if ( !canObserveMutations ) {
        this._docWasChanged();
    }

    return this;
};

var increaseBlockQuoteLevel = function ( frag ) {
    return this.createElement( 'BLOCKQUOTE',
        this._config.tagAttributes.blockquote, [
            frag
        ]);
};

var increaseIndentLevel = function ( frag ) {
  var props = this._config.tagAttributes.blockquote || {};

  props.class = 'au-no-left-border';

  return this.createElement( 'BLOCKQUOTE', props, [frag])
}

var decreaseBlockQuoteLevel = function ( frag ) {
    var root = this._root;
    var blockquotes = frag.querySelectorAll( 'blockquote' );
    Array.prototype.filter.call( blockquotes, function ( el ) {
        return !getNearest( el.parentNode, root, 'BLOCKQUOTE' );
    }).forEach( function ( el ) {
        replaceWith( el, empty( el ) );
    });
    return frag;
};

var removeBlockQuote = function (/* frag */) {
    return this.createDefaultBlock([
        this.createElement( 'INPUT', {
            id: startSelectionId,
            type: 'hidden'
        }),
        this.createElement( 'INPUT', {
            id: endSelectionId,
            type: 'hidden'
        })
    ]);
};

var makeList = function ( self, frag, type ) {
    var walker = getBlockWalker( frag, self._root ),
        node, tag, prev, newLi,
        tagAttributes = self._config.tagAttributes,
        listAttrs = tagAttributes[ type.toLowerCase() ],
        listItemAttrs = tagAttributes.li;
    var div = frag.childNodes[0]

    while ( node = walker.nextNode() ) {
        tag = node.parentNode.nodeName;
        if ( tag !== 'LI' ) {
            newLi = self.createElement( 'LI', listItemAttrs );
            if ( node.dir ) {
                newLi.dir = node.dir;
            }

            // Have we replaced the previous block with a new <ul>/<ol>?
            if ( ( prev = node.previousSibling ) &&
                    prev.nodeName === type ) {
                prev.appendChild( newLi );
            }
            // Otherwise, replace this block with the <ul>/<ol>
            else {
                replaceWith(
                    node,
                    self.createElement( type, listAttrs, [
                        newLi
                    ])
                );
            }
            newLi.appendChild( empty( node ) );
        } else {
            node = node.parentNode.parentNode;
            tag = node.nodeName;
            if ( tag !== type && ( /^[OU]L$/.test( tag ) ) ) {
                replaceWith( node,
                    self.createElement( type, listAttrs, [ empty( node ) ] )
                );
            }
        }
    }
};
proto.inList = function () {
  var active_formats = this.getPath().split('>')
  return active_formats.indexOf('OL') > -1 || active_formats.indexOf('UL') > -1
}

var makeUnorderedList = function ( frag ) {
    if (!this.inList()){
      makeList( this, frag, 'UL' );
    }
    return frag;
};

var makeOrderedList = function ( frag ) {
    if (!this.inList()){
    makeList( this, frag, 'OL' );
    }
    return frag;
};

var removeList = function ( frag ) {
    var lists = frag.querySelectorAll( 'UL, OL' ),
        i, l, ll, list, listFrag, children, child;
    for ( i = 0, l = lists.length; i < l; i += 1 ) {
        list = lists[i];
        listFrag = empty( list );
        children = listFrag.childNodes;
        ll = children.length;
        while ( ll-- ) {
            child = children[ll];
            replaceWith( child, empty( child ) );
        }
        fixContainer( listFrag, this._root );
        replaceWith( list, listFrag );
    }
    return frag;
};

var increaseListLevel = function ( frag ) {
    if(this.inList()){
      return frag
    }
    var items = frag.querySelectorAll( 'LI' ),
        i, l, item,
        type, newParent,
        tagAttributes = this._config.tagAttributes,
        listItemAttrs = tagAttributes.li,
        listAttrs;
    for ( i = 0, l = items.length; i < l; i += 1 ) {
        item = items[i];
        if ( !isContainer( item.firstChild ) ) {
            // type => 'UL' or 'OL'
            type = item.parentNode.nodeName;
            newParent = item.previousSibling;
            if ( !newParent || !( newParent = newParent.lastChild ) ||
                    newParent.nodeName !== type ) {
                listAttrs = tagAttributes[ type.toLowerCase() ];
                replaceWith(
                    item,
                    this.createElement( 'LI', listItemAttrs, [
                        newParent = this.createElement( type, listAttrs )
                    ])
                );
            }
            newParent.appendChild( item );
        }
    }
    return frag;
};

var decreaseListLevel = function ( frag ) {
    var root = this._root;
    var items = frag.querySelectorAll( 'LI' );
    Array.prototype.filter.call( items, function ( el ) {
        return !isContainer( el.firstChild );
    }).forEach( function ( item ) {
        var parent = item.parentNode,
            newParent = parent.parentNode,
            first = item.firstChild,
            node = first,
            next;
        if ( item.previousSibling ) {
            parent = split( parent, item, newParent, root );
        }
        while ( node ) {
            next = node.nextSibling;
            if ( isContainer( node ) ) {
                break;
            }
            newParent.insertBefore( node, parent );
            node = next;
        }
        if ( newParent.nodeName === 'LI' && first.previousSibling ) {
            split( newParent, first, newParent.parentNode, root );
        }
        while ( item !== frag && !item.childNodes.length ) {
            parent = item.parentNode;
            parent.removeChild( item );
            item = parent;
        }
    }, this );
    fixContainer( frag, root );
    return frag;
};

proto._ensureBottomLine = function () {
    var root = this._root;
    var last = root.lastElementChild;
    if ( !last || !isBlock( last ) ) {
        root.appendChild( this.createDefaultBlock() );
    }
};

// --- Keyboard interaction ---

proto.setKeyHandler = function ( key, fn ) {
    this._keyHandlers[ key ] = fn;
    return this;
};

// --- Get/Set data ---

proto._getHTML = function () {
    return this._root.innerHTML;
};

proto._setHTML = function ( html ) {
    var root = this._root;
    var node = root;
    node.innerHTML = html;
    do {
        fixCursor( node, root );
    } while ( node = getNextBlock( node, root ) );
    this._ignoreChange = true;
};

/*
options =
{
    withBookMark: 1, //will include tags for cursor position
    stripEndBrs: 1, //remove BRs from the end of block elements
}

*/

proto.getHTML = function ( options ) {
    if(!options){
        options = {}
    }
    var brs = [],
        root, node, fixer, html, l, range;
    var withBookMark = options["withBookMark"]
    var root = this._root

    // saving the range to a bookmark needs to come first since it will put back
    // many of the br tags that have been removed
    if ( withBookMark && ( range = this.getSelection() ) ) {
        this._saveRangeToBookmark( range );
    }

    // two options here with the first being more drastic
    if(options["stripAllBrs"]){
        removeAllBrs(root)
    }
    else if(options["stripEndBrs"]){
        removeBrAtEndOfAllLines(root)
    }

    if ( useTextFixer ) {
        root = this._root;
        node = root;
        while ( node = getNextBlock( node, root ) ) {
            if ( !node.textContent && !node.querySelector( 'BR' ) ) {
                fixer = this.createElement( 'BR' );
                node.appendChild( fixer );
                brs.push( fixer );
            }
        }
    }
    html = this._getHTML().replace( /\u200B/g, '' );
    if ( useTextFixer ) {
        l = brs.length;
        while ( l-- ) {
            detach( brs[l] );
        }
    }
    if ( range ) {
        this._getRangeAndRemoveBookmark( range );
    }
    // TODO: NATE: might need to extend this to li elements.  Squire uses BR tags
    // internally to correct some browser behavior but we don't necessarily wants
    // these tags in the html we are saving on the server.
    if(options["stripEndBrs"]){
        ensureBrAtEndOfAllLines(root)
    }
    else if(options["stripAllBrs"]){
        ensureBrAtEndOfAllTags(root, ['div', 'li', 'h1', 'h2', 'h3'])
    }
    return html;
};

// options["focus"]: call this.focus and set selection to range
proto.setHTML = function ( html, options ) {
    if(!options){
        options = {}
    }
    var frag = this._doc.createDocumentFragment();
    var div = this.createElement( 'DIV' );
    var root = this._root;
    var child;

    // Parse HTML into DOM tree
    div.innerHTML = html;
    frag.appendChild( empty( div ) );

    cleanTree( frag, true );
    cleanupBRs( frag, root );

    fixContainer( frag, root );

    // Fix cursor
    var node = frag;
    while ( node = getNextBlock( node, root ) ) {
        fixCursor( node, root );
    }

    // Don't fire an input event
    this._ignoreChange = true;

    // Remove existing root children
    while ( child = root.lastChild ) {
        root.removeChild( child );
    }

    // And insert new content
    root.appendChild( frag );
    fixCursor( root, root );

    // Reset the undo stack
    this._undoIndex = -1;
    this._undoStack.length = 0;
    this._undoStackLength = 0;
    this._isInUndoState = false;
    // Record undo state
    var range = this._getRangeAndRemoveBookmark() ||
        this._createRange( root.firstChild, 0 );
    this.saveUndoState( range );
    // IE will also set focus when selecting text so don't use
    // setSelection. Instead, just store it in lastSelection, so if
    // anything calls getSelection before first focus, we have a range
    // to return.
    this._lastSelection = range;
    enableRestoreSelection.call( this );
    this._updatePath( range, true );
    if(options["focus"]){
      this.focus()
      this.setSelection(range)
    }
    return this;
};

proto.insertElement = function ( el, range ) {
    if ( !range ) { range = this.getSelection(); }
    range.collapse( true );
    if ( isInline( el ) ) {
        this.insertNodeInRange( range, el );
        range.setStartAfter( el );
    } else {
        // Get containing block node.
        var root = this._root;
        var splitNode = getStartBlockOfRange( range, root ) || root;
        var parent, nodeAfterSplit;
        // While at end of container node, move up DOM tree.
        while ( splitNode !== root && !splitNode.nextSibling ) {
            splitNode = splitNode.parentNode;
        }
        // If in the middle of a container node, split up to root.
        if ( splitNode !== root ) {
            parent = splitNode.parentNode;
            nodeAfterSplit = split( parent, splitNode.nextSibling, root, root );
        }
        if ( nodeAfterSplit ) {
            root.insertBefore( el, nodeAfterSplit );
        } else {
            root.appendChild( el );
            // Insert blank line below block.
            nodeAfterSplit = this.createDefaultBlock();
            root.appendChild( nodeAfterSplit );
        }
        range.setStart( nodeAfterSplit, 0 );
        range.setEnd( nodeAfterSplit, 0 );
        moveRangeBoundariesDownTree( range );
    }
    this.focus();
    this.setSelection( range );
    this._updatePath( range );

    if ( !canObserveMutations ) {
        this._docWasChanged();
    }

    return this;
};

proto.insertImage = function ( src, attributes ) {
    var img = this.createElement( 'IMG', mergeObjects({
        src: src
    }, attributes, true ));
    this.insertElement( img );
    return img;
};

var linkRegExp = /\b((?:(?:ht|f)tps?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,}\/)(?:[^\s()<>]+|\([^\s()<>]+\))+(?:\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))|([\w\-.%+]+@(?:[\w\-]+\.)+[A-Z]{2,}\b)/i;

var addLinks = function ( frag, root, self ) {
    var doc = frag.ownerDocument,
        walker = new TreeWalker( frag, SHOW_TEXT,
                function ( node ) {
            return !getNearest( node, root, 'A' );
        }, false ),
        defaultAttributes = self._config.tagAttributes.a,
        node, data, parent, match, index, endIndex, child;
    while ( node = walker.nextNode() ) {
        data = node.data;
        parent = node.parentNode;
        while ( match = linkRegExp.exec( data ) ) {
            index = match.index;
            endIndex = index + match[0].length;
            if ( index ) {
                child = doc.createTextNode( data.slice( 0, index ) );
                parent.insertBefore( child, node );
            }
            child = self.createElement( 'A', mergeObjects({
                href: match[1] ?
                    /^(?:ht|f)tps?:/.test( match[1] ) ?
                        match[1] :
                        'http://' + match[1] :
                    'mailto:' + match[2]
            }, defaultAttributes, false ));
            child.textContent = data.slice( index, endIndex );
            parent.insertBefore( child, node );
            node.data = data = data.slice( endIndex );
        }
    }
};

// Insert HTML at the cursor location. If the selection is not collapsed
// insertTreeFragmentIntoRange will delete the selection so that it is replaced
// by the html being inserted.
proto.insertHTML = function ( html, isPaste ) {
    console.info("INSERTHTML")
    var range = this.getSelection();
    var doc = this._doc;
    var startFragmentIndex, endFragmentIndex;
    var div, frag, root, node, event;

    // Edge doesn't just copy the fragment, but includes the surrounding guff
    // including the full <head> of the page. Need to strip this out. If
    // available use DOMPurify to parse and sanitise.
    if ( typeof DOMPurify !== 'undefined' && DOMPurify.isSupported ) {
        frag = DOMPurify.sanitize( html, {
            WHOLE_DOCUMENT: false,
            RETURN_DOM: true,
            RETURN_DOM_FRAGMENT: true
        });
        frag = doc.importNode( frag, true );
    } else {
        if ( isPaste ) {
            startFragmentIndex = html.indexOf( '<!--StartFragment-->' );
            endFragmentIndex = html.lastIndexOf( '<!--EndFragment-->' );
            if ( startFragmentIndex > -1 && endFragmentIndex > -1 ) {
                html = html.slice( startFragmentIndex + 20, endFragmentIndex );
            }
        }
        // Parse HTML into DOM tree
        div = this.createElement( 'DIV' );
        div.innerHTML = html;
        frag = doc.createDocumentFragment();
        frag.appendChild( empty( div ) );
    }

    // Record undo checkpoint
    this.saveUndoState( range );

    try {
        root = this._root;
        node = frag;
        event = {
            fragment: frag,
            preventDefault: function () {
                this.defaultPrevented = true;
            },
            defaultPrevented: false
        };

        addLinks( frag, frag, this );
        cleanTree( frag, true );
        collapseSimpleSpans( frag )
        mergeInlines( frag, range )
        cleanupBRs( frag, null );
        removeEmptyInlines( frag );
        frag.normalize();
        ensureBrAtEndOfAllLines(frag)
        //NATE: This is a clear spot to do something of the sort:
        // registeredFilters.each(function(filter){filter(frag)})

        while ( node = getNextBlock( node, frag ) ) {
            fixCursor( node, null );
        }

        if ( isPaste ) {
            this.fireEvent( 'willPaste', event );
        }

        if ( !event.defaultPrevented ) {
            insertTreeFragmentIntoRange( range, event.fragment, root );
            if ( !canObserveMutations ) {
                this._docWasChanged();
            }
            range.collapse( false );
            this._ensureBottomLine();
        }

        this.setSelection( range );
        this._updatePath( range, true );
        // Safari sometimes loses focus after paste. Weird.
        if ( isPaste ) {
            this.focus();
        }
    } catch ( error ) {
        this.didError( error );
    }
    return this;
};

var escapeHTMLFragement = function ( text ) {
    return text.split( '&' ).join( '&amp;' )
               .split( '<' ).join( '&lt;'  )
               .split( '>' ).join( '&gt;'  )
               .split( '"' ).join( '&quot;'  );
};

proto.insertPlainText = function ( plainText, isPaste ) {
    var lines = plainText.split( '\n' );
    var config = this._config;
    var tag = config.blockTag;
    var attributes = config.blockAttributes;
    var closeBlock  = '</' + tag + '>';
    var openBlock = '<' + tag;
    var attr, i, l, line;

    for ( attr in attributes ) {
        openBlock += ' ' + attr + '="' +
            escapeHTMLFragement( attributes[ attr ] ) +
        '"';
    }
    openBlock += '>';

    for ( i = 0, l = lines.length; i < l; i += 1 ) {
        line = lines[i];
        line = escapeHTMLFragement( line ).replace( / (?= )/g, '&nbsp;' );
        // Wrap all but first/last lines in <div></div>
        if ( i && i + 1 < l ) {
            line = openBlock + ( line || '<BR>' ) + closeBlock;
        }
        lines[i] = line;
    }
    return this.insertHTML( lines.join( '' ), isPaste );
};

// --- Formatting ---

var command = function ( method, arg, arg2 ) {
    return function () {
        this[ method ]( arg, arg2 );
        return this.focus();
    };
};

proto.addStyles = function ( styles ) {
    if ( styles ) {
        var head = this._doc.documentElement.firstChild,
            style = this.createElement( 'STYLE', {
                type: 'text/css'
            });
        style.appendChild( this._doc.createTextNode( styles ) );
        head.appendChild( style );
    }
    return this;
};

proto.bold = command( 'changeFormat', { tag: 'B' } );
proto.italic = command( 'changeFormat', { tag: 'I' } );
proto.underline = command( 'changeFormat', { tag: 'U' } );
proto.strikethrough = command( 'changeFormat', { tag: 'S' } );
proto.subscript = command( 'changeFormat', { tag: 'SUB' }, { tag: 'SUP' } );
proto.superscript = command( 'changeFormat', { tag: 'SUP' }, { tag: 'SUB' } );

proto.removeBold = command( 'changeFormat', null, { tag: 'B' } );
proto.removeItalic = command( 'changeFormat', null, { tag: 'I' } );
proto.removeUnderline = command( 'changeFormat', null, { tag: 'U' } );
proto.removeStrikethrough = command( 'changeFormat', null, { tag: 'S' } );
proto.removeSubscript = command( 'changeFormat', null, { tag: 'SUB' } );
proto.removeSuperscript = command( 'changeFormat', null, { tag: 'SUP' } );

proto.addCode = command( 'changeFormat', { tag: 'CODE' } );
proto.removeCode = command( 'changeFormat', null, { tag: 'CODE' } );
proto.toggleCode = function () {
  if( this.hasFormat('CODE')){
    this.removeCode()
  } else{
    this.addCode()
  }
}

proto.makeLink = function ( url, attributes ) {
    var range = this.getSelection();
    if ( range.collapsed ) {
        var protocolEnd = url.indexOf( ':' ) + 1;
        if ( protocolEnd ) {
            while ( url[ protocolEnd ] === '/' ) { protocolEnd += 1; }
        }
        this.insertNodeInRange(
            range,
            this._doc.createTextNode( url.slice( protocolEnd ) )
        );
    }
    attributes = mergeObjects(
        mergeObjects({
            href: url
        }, attributes, true ),
        this._config.tagAttributes.a,
        false
    );

    this.changeFormat({
        tag: 'A',
        attributes: attributes
    }, {
        tag: 'A'
    }, range );
    return this.focus();
};
proto.removeLink = function () {
    this.changeFormat( null, {
        tag: 'A'
    }, this.getSelection(), true );
    return this.focus();
};

proto.setFontFace = function ( name ) {
    this.changeFormat( name ? {
        tag: 'SPAN',
        attributes: {
            'class': 'font',
            style: 'font-family: ' + name + ', sans-serif;'
        }
    } : null, {
        tag: 'SPAN',
        attributes: { 'class': 'font' }
    });
    return this.focus();
};
proto.setFontSize = function ( size ) {
    this.changeFormat( size ? {
        tag: 'SPAN',
        attributes: {
            'class': 'size',
            style: 'font-size: ' +
                ( typeof size === 'number' ? size + 'px' : size )
        }
    } : null, {
        tag: 'SPAN',
        attributes: { 'class': 'size' }
    });
    return this.focus();
};

proto.setTextColour = function ( colour ) {
    this.changeFormat( colour ? {
        tag: 'SPAN',
        attributes: {
            'class': 'colour',
            style: 'color:' + colour
        }
    } : null, {
        tag: 'SPAN',
        attributes: { 'class': 'colour' }
    });
    return this.focus();
};

proto.setHighlightColour = function ( colour ) {
    this.changeFormat( colour ? {
        tag: 'SPAN',
        attributes: {
            'class': 'highlight',
            style: 'background-color:' + colour
        }
    } : colour, {
        tag: 'SPAN',
        attributes: { 'class': 'highlight' }
    });
    return this.focus();
};

proto.setTextAlignment = function ( alignment ) {
    this.forEachBlock( function ( block ) {
        block.className = ( block.className
            .split( /\s+/ )
            .filter( function ( klass ) {
                return !( /align/.test( klass ) );
            })
            .join( ' ' ) +
            ' align-' + alignment ).trim();
        block.style.textAlign = alignment;
    }, true );
    return this.focus();
};

proto.setTextDirection = function ( direction ) {
    this.forEachBlock( function ( block ) {
        block.dir = direction;
    }, true );
    return this.focus();
};

function removeFormatting ( self, root, clean ) {
    var node, next;
    for ( node = root.firstChild; node; node = next ) {
        next = node.nextSibling;
        if ( isInline( node ) ) {
            if ( node.nodeType === TEXT_NODE || node.nodeName === 'BR' || node.nodeName === 'IMG' ) {
                clean.appendChild( node );
                continue;
            }
        } else if ( isBlock( node ) ) {
            clean.appendChild( self.createDefaultBlock([
                removeFormatting(
                    self, node, self._doc.createDocumentFragment() )
            ]));
            continue;
        }
        removeFormatting( self, node, clean );
    }
    return clean;
}

proto.removeAllFormatting = function ( range ) {
    if ( !range && !( range = this.getSelection() ) || range.collapsed ) {
        return this;
    }

    var root = this._root;
    var stopNode = range.commonAncestorContainer;
    while ( stopNode && !isBlock( stopNode ) ) {
        stopNode = stopNode.parentNode;
    }
    if ( !stopNode ) {
        expandRangeToBlockBoundaries( range, root );
        stopNode = root;
    }
    if ( stopNode.nodeType === TEXT_NODE ) {
        return this;
    }

    // Record undo point
    this.saveUndoState( range );

    // Avoid splitting where we're already at edges.
    moveRangeBoundariesUpTree( range, stopNode );

    // Split the selection up to the block, or if whole selection in same
    // block, expand range boundaries to ends of block and split up to root.
    var doc = stopNode.ownerDocument;
    var startContainer = range.startContainer;
    var startOffset = range.startOffset;
    var endContainer = range.endContainer;
    var endOffset = range.endOffset;

    // Split end point first to avoid problems when end and start
    // in same container.
    var formattedNodes = doc.createDocumentFragment();
    var cleanNodes = doc.createDocumentFragment();
    var nodeAfterSplit = split( endContainer, endOffset, stopNode, root );
    var nodeInSplit = split( startContainer, startOffset, stopNode, root );
    var nextNode, childNodes;

    // Then replace contents in split with a cleaned version of the same:
    // blocks become default blocks, text and leaf nodes survive, everything
    // else is obliterated.
    while ( nodeInSplit !== nodeAfterSplit ) {
        nextNode = nodeInSplit.nextSibling;
        formattedNodes.appendChild( nodeInSplit );
        nodeInSplit = nextNode;
    }
    removeFormatting( this, formattedNodes, cleanNodes );
    cleanNodes.normalize();
    nodeInSplit = cleanNodes.firstChild;
    nextNode = cleanNodes.lastChild;

    // Restore selection
    childNodes = stopNode.childNodes;
    if ( nodeInSplit ) {
        stopNode.insertBefore( cleanNodes, nodeAfterSplit );
        startOffset = indexOf.call( childNodes, nodeInSplit );
        endOffset = indexOf.call( childNodes, nextNode ) + 1;
    } else {
        startOffset = indexOf.call( childNodes, nodeAfterSplit );
        endOffset = startOffset;
    }

    // Merge text nodes at edges, if possible
    range.setStart( stopNode, startOffset );
    range.setEnd( stopNode, endOffset );
    mergeInlines( stopNode, range );

    // And move back down the tree
    moveRangeBoundariesDownTree( range );

    this.setSelection( range );
    this._updatePath( range, true );

    return this.focus();
};

proto.increaseQuoteLevel = command( 'modifyBlocks', increaseBlockQuoteLevel );
proto.decreaseQuoteLevel = command( 'modifyBlocks', decreaseBlockQuoteLevel );

proto.increaseIndentLevel = command( 'modifyBlocks', increaseIndentLevel )
// TODO: NATE: should this be decreaseListLevel?
proto.decreaseIndentLevel = proto.decreaseQuoteLevel

proto.makeUnorderedList = command( 'modifyBlocks', makeUnorderedList );
proto.makeOrderedList = command( 'modifyBlocks', makeOrderedList );
proto.removeList = command( 'modifyBlocks', removeList );

proto.increaseListLevel = command( 'modifyBlocks', increaseListLevel );
proto.decreaseListLevel = command( 'modifyBlocks', decreaseListLevel );

proto.insertNodeInRange = insertNodeInRange;
