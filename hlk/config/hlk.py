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
				},
				{
					"type": "doctype",
					"name": "HLK Text Template",
					"label": _("HLK Text Template"),
					"description": _("HLK Text Template")
				},
				{
					"type": "doctype",
					"name": "HLK Structur Organisation Template",
					"label": _("HLK Structur Organisation Template"),
					"description": _("HLK Structur Organisation Template")
				}
			]
		},
		{
			"label": _("Integrations"),
			"icon": "fa fa-cogs",
			"items": [
				{
					"type": "page",
					"name": "bkp-importer",
					"label": _("BKP Importer"),
					"description": _("BKP Importer")                   
				}
			]
		}
	]

	
	
	