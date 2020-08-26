from __future__ import unicode_literals
from frappe import _

def get_data():
	return[
		{
			"label": _("Settings"),
			"icon": "fa fa-cogs",
			"items": [
				{
					"type": "doctype",
					"name": "HLK Settings",
					"label": _("HLK Settings"),
					"description": _("HLK Settings")
				}
			]
		}
	]
