(function(DjangoPeriod, $, undefined){

    if(window.DjangoPeriod == undefined)
	window.DjangoPeriod = DjangoPeriod;

    var inited = false;
    var nextId = 0;
    var options = {
	debug: false,
	query: 'input.dj-period',
	dataAttribute: 'period-start',
	inputTemplate: 
	'<input type="range" />',
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
	    $(options.query).each(function(){
		DjangoPeriod.debug('Found', this);
		DjangoPeriod.buildInput(this);
	    });
	});
    };

    DjangoPeriod.getIStart = function(obj){
	var self = $(obj);
	return $(self.attr(options.dataAttribute));
    };

    DjangoPeriod.getIEnd = function(obj){
	var self = $(obj);
	return self.prev('.'+options.className);
    };

    DjangoPeriod.findInFirstParent = function(qs, ctx){
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
	var endDt = endDate.getFullYear()+'-'+(1+endDate.getMonth())+'-'+endDate.getDate();
	var endTm = endDate.getHours()+':'+endDate.getMinutes();
	end.val(endDt+' '+endTm);
	DjangoPeriod.debug('end.val',end.val());
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

	var endDate = new Date(endValue);
	DjangoPeriod.debug('endValue', endValue);

	var milis = endDate - startDate;
	self.val(Math.round((milis/1000)/60));
    };

    DjangoPeriod.buildMinutesInput = function(obj){
	var self = $(obj);
	var label = DjangoPeriod.getILabel(obj);
	obj.attr({
	    min: 0,
	    max: 60,
	    step: options.rangeStep,
	    title: label.text() + '(_#_ minutes)'
	});
    };

    DjangoPeriod.buildInput = function(hiddenInput){

	var self = $(hiddenInput);
		
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