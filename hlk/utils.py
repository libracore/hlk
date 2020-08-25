# -*- coding: utf-8 -*-
# Copyright (c) 2020, libracore and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

@frappe.whitelist()
def calc_structur_organisation_totals(dt, dn):
	document = frappe.get_doc(dt, dn)
	parent_elements = []
	sub_parent_elements = []
	
	for structur_element in document.hlk_structur_organisation:
		if not structur_element.parent_element:
			parent_elements.append(structur_element.main_element)
			
	for structur_element in document.hlk_structur_organisation:
		if structur_element.parent_element in parent_elements:
			sub_parent_elements.append(structur_element.main_element)
			
	for structur_element in document.hlk_structur_organisation:
		if not structur_element.parent_element in parent_elements:
			if not structur_element.main_element in sub_parent_elements:
				structur_element.total = frappe.db.sql("""SELECT SUM(`amount`) FROM `tab{dt} Item` WHERE `hlk_element` = '{hlk_element}' AND `parent` = '{dn}'""".format(dt=dt, hlk_element=structur_element.main_element, dn=dn), as_list=True)[0][0]
				
	for structur_element in document.hlk_structur_organisation:
		if structur_element.main_element in sub_parent_elements:
			amount = 0
			for _structur_element in document.hlk_structur_organisation:
				if _structur_element.parent_element == structur_element.main_element:
					amount += _structur_element.total
			structur_element.total = amount
			
	for structur_element in document.hlk_structur_organisation:
		if structur_element.main_element in parent_elements:
			amount = 0
			for _structur_element in document.hlk_structur_organisation:
				if _structur_element.parent_element == structur_element.main_element:
					amount += _structur_element.total
			structur_element.total = amount
			
	document.save()
	
@frappe.whitelist()
def transfer_structur_organisation_discounts(dt, dn):
	document = frappe.get_doc(dt, dn)
	parent_elements = []
	sub_parent_elements = []
	
	for structur_element in document.hlk_structur_organisation:
		if not structur_element.parent_element:
			parent_elements.append(structur_element.main_element)
			
	for structur_element in document.hlk_structur_organisation:
		if structur_element.parent_element in parent_elements:
			sub_parent_elements.append(structur_element.main_element)
			
	for structur_element in document.hlk_structur_organisation:
		if not structur_element.parent_element in parent_elements:
			if not structur_element.main_element in sub_parent_elements:
				if structur_element.discounting:
					if structur_element.discount_in_percent > 0:
						for item in document.items:
							if item.hlk_element == structur_element.main_element:
								if item.margin_type not in ['Percentage', 'Amount']:
									item.discount_percentage = structur_element.discount_in_percent
									item.discount_amount = (item.price_list_rate / 100) * structur_element.discount_in_percent
									item.rate = item.rate - item.discount_amount
									item.net_rate = item.rate
									item.amount = item.rate * item.qty
									item.net_amount = item.amount
								else:
									item.discount_percentage = structur_element.discount_in_percent
									item.discount_amount = (item.rate_with_margin / 100) * structur_element.discount_in_percent
								if structur_element.show_discount:
									item.do_not_show_discount = 0
								else:
									item.do_not_show_discount = 1
				else:
					structur_element.discount_in_percent = 0.00
					for item in document.items:
						if item.hlk_element == structur_element.main_element:
							if item.margin_type not in ['Percentage', 'Amount']:
								item.discount_percentage = 0.00
								item.discount_amount = 0.00
								item.rate = item.price_list_rate
								item.net_rate = item.rate
								item.amount = item.rate * item.qty
								item.net_amount = item.amount
							else:
								item.discount_percentage = 0.00
								item.discount_amount = 0.00
								item.rate = item.rate_with_margin
								item.net_rate = item.rate
								item.amount = item.rate_with_margin * item.qty
								item.net_amount = item.amount
							item.do_not_show_discount = 0
	document.save()