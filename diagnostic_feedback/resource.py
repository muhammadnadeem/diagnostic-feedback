from .config import student_assets, studio_assets

from xblockutils.resources import ResourceLoader
loader = ResourceLoader(__name__)


class ResourceMixin(object):
    """
        contain method to load css/js/htmll resource for student and studio view
    """

    def sort_resources_by_order(self, lst):
        return sorted(lst, key=lambda x: x[1])

    def add_templates(self, fragment, context, view):
        # add templates in html fragment for studio/student view

        templates = self.sort_resources_by_order(student_assets.get('templates', [])
                                                 if view == 'student' else studio_assets.get('templates', [])
                                                 )
        for template, order in templates:
            fragment.add_content(loader.render_template(template, context))

    def add_css(self, fragment, view):
        # add css in fragment for studio/student view

        css_resources = self.sort_resources_by_order(student_assets.get('css', [])
                                                     if view == 'student' else studio_assets.get('css', [])
                                                     )
        for css, order in css_resources:
            if css.startswith('http'):
                fragment.add_css_url(css)
            else:
                fragment.add_css_url(self.runtime.local_resource_url(self, css))

    def add_js(self, fragment, view):
        # add css in fragment for studio/student view

        js_resources = self.sort_resources_by_order(student_assets.get('js', [])
                                                    if view == 'student' else studio_assets.get('js', [])
                                                    )
        for js, order in js_resources:
            if js.startswith('http'):
                fragment.add_javascript_url(js)
            else:
                fragment.add_javascript_url(self.runtime.local_resource_url(self, js))

    def initialize_js_classes(self, fragment, view, json_args):
        # initialize js

        js_classes = self.sort_resources_by_order(student_assets.get('js_classes', [])
                                                  if view == 'student' else studio_assets.get('js_classes', [])
                                                  )
        for _class, order in js_classes:
            fragment.initialize_js(_class, json_args)