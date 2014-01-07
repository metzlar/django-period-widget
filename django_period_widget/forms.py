from django.forms import widgets


class PeriodWidget(widgets.SplitHiddenDateTimeWidget):
    def __init__(self, *args, **kwargs):
        attrs = kwargs.pop('attrs', {})

        if 'class' in attrs:
            attrs['class'] = attrs['class'] + ' dj-period-end'
        else:
            attrs['class'] = 'dj-period-end'
            
        super(PeriodWidget, self).__init__(
            attrs=attrs, *args, **kwargs)
        
    class Media:
        js = (
            'django_period_widget/js/period.js',
        )