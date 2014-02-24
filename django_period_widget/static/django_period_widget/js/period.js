(function(DjangoPeriod, $, undefined){

    if(window.DjangoPeriod == undefined)
	window.DjangoPeriod = DjangoPeriod;

    $.fn.reverse = [].reverse

    var inited = false;
    var nextId = 0;
    var options = {
	debug: false,
	query: 'input.dj-period-end',
	dataAttribute: 'period-start',
	inputTemplate: '<select />', //'<input type="range" />',
	className: 'dj-period',
	rangeStep: 5,
	rangeUnit: 'minutes',
	rangeDefault: 15
    };

    DjangoPeriod.init = function(opts){
	if(inited !== false) return;
	inited = true;

	options = $.extend(options, opts);

	DjangoPeriod.debug(
	    'Initing Period inputs for $("'+options.query+'")');

	$(function(){
	    var hiddenInputs = DjangoPeriod.filterParents(
		$(options.query));
	    DjangoPeriod.buildInput(hiddenInputs);
	});
    };

    DjangoPeriod.filterParents = function(query){
	/*  Remove all elements that share a parent with
	  * another element in `query` This is required
	  * to treat time & date fields as one single field.
	  */

	var result = $();

	query.reverse().each(function(){
	    var me = $(this);
	    if($.inArray(me.parent()[0], result.parent())){
		result = result.add(me);
	    }
	});
	return result;
    };

    DjangoPeriod.getIStart = function(obj){
	var self = $(obj);
	return $(self.attr(options.dataAttribute));
    };

    DjangoPeriod.getIEnd = function(obj){
	var self = $(obj);
	return $(options.query, self.parent()).not(self);
    };

    DjangoPeriod.findInFirstParent = function(qs, ctx){
	/* Search in the parent of ctx for qs
	 * If qs is not found, search in the parent of the
	 * parent. Continue searching in all subtrees of parents
	 * until no parent is left or qs is found.
	 */
	var parent = ctx.parent();
	if(!parent) return undefined;
	var test = $(qs, parent);
	if(test.length>0) return test;
	else return DjangoPeriod.findInFirstParent(qs, parent);
    };

    DjangoPeriod.getILabel = function(obj){
	var self = $(obj);
	return DjangoPeriod.findInFirstParent('label', self);
    };

    DjangoPeriod.val2date = function(obj){
	var self = $(obj);
	var start = DjangoPeriod.getIStart(self);
	var startValue = '';
	start.each(function(){startValue+=$(this).val()+' '});
	var end = DjangoPeriod.getIEnd(self);
	var startDate = new Date(startValue);
	var myVal = self.val();
	var label = DjangoPeriod.getILabel(self);
	label.text(self.attr('title').replace('_#_', myVal));
	var endDate = new Date(startDate.getTime() + (myVal*60000));
	var endDt = endDate.getFullYear()+'-'+(
	    1+endDate.getMonth())+'-'+endDate.getDate();
	var endTm = endDate.getHours()+':'+endDate.getMinutes();
	if(end.length>1){
	    $(end[0]).val(endDt);
	    $(end[1]).val(endTm);
	} else {
	    end.val(endDt+' '+endTm);
	}
	DjangoPeriod.debug('end~val',end.val());
    };

    DjangoPeriod.date2val = function(obj){
	var self = $(obj);
	var start = DjangoPeriod.getIStart(self);
	var startValue = '';
	start.each(function(){startValue+=$(this).val()+' '});
	DjangoPeriod.debug('startValue ='+startValue+'=');	
	if(/^\s+$/.test(startValue)){
	    DjangoPeriod.debug('No start date yet');
	    self.val(options.rangeDefault);
	    self.trigger('change');
	    return;
	}
	var startDate = new Date(startValue);

	var end = DjangoPeriod.getIEnd(self);
	var endValue = '';
	end.each(function(){endValue+=$(this).val()+' '});
	if(/^\s+$/.test(endValue)){
	    DjangoPeriod.debug('No end date yet');
	    self.val(options.rangeDefault);
	    self.trigger('change');
	    return;
	}
	DjangoPeriod.debug('endValue', endValue);
	var endDate = new Date(endValue);
	DjangoPeriod.debug('endDate ='+endDate+'=');

	var milis = endDate - startDate;
	var self_val = 1+Math.round((milis/1000)/60);

	DjangoPeriod.debug('self_val', self_val);
	self.val(self_val);
    };

    DjangoPeriod.buildMinutesInput = function(obj){
	var label = DjangoPeriod.getILabel(obj);
	for(var i=0; i<=60; i+=options.rangeStep){
	    obj.append($('<option value="'+(
		i)+'">'+(i)+' minutes</option>'));
	}
	obj.attr('title', label.text() + '(_#_ minutes)')
   };

    DjangoPeriod.buildInput = function(hiddenInput){

	var self = $(hiddenInput);

	if(!options.debug)
	    self.hide();
		
	DjangoPeriod.debug('Building Input', self);

	var i = $(options.inputTemplate).insertAfter(self);
	i.attr(
	    options.dataAttribute, 
	    self.attr(options.dataAttribute));
	i.addClass(options.className);

	if(options.rangeUnit==='minutes'){
	    DjangoPeriod.buildMinutesInput(i);
	}
	
	var handler = function(){DjangoPeriod.val2date(i)};

	i.change(handler);
	i.mousedown(handler);

	var start = DjangoPeriod.getIStart(i);
	start.change(handler);

	DjangoPeriod.date2val(i);
	DjangoPeriod.val2date(i);
    };

    DjangoPeriod.debug = function(){
	if(options.debug){
	    console.log(
		'[DjangoPeriod] DEBUG ' + Array.prototype.join.call(
		    arguments, ', '));
	}
    };

})(
    window.DjangoPeriod || {},
    window.jQuery
);

window.DjangoPeriod.init({debug:true});