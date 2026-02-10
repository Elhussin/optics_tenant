You do not need to link InvoiceType to many Partners directly.

The connection happens automatically through the Flexible Price Rules.

Here is the recommended workflow to handle "Invoice Type + Many Partners + Special Prices":

Configure Invoice Type:
Create Invoice Type: "Insurance Invoice"
Link it to Policy: "General Insurance Policy"
Configure Partners:
Create Partner: AXA
Create Partner: Bupa
Connect Them (The Matrix): You create Flexible Price Rules (this is the key step):
Variant	Policy	Partner	Price	Result
Lens X	Insurance Policy	AXA	50	When you do an Insurance Invoice for AXA, price is 50.
Lens X	Insurance Policy	Bupa	60	When you do an Insurance Invoice for Bupa, price is 60.
Lens X	Insurance Policy	Empty	70	When you do an Insurance Invoice for Anyone Else, price is 70.
How it works in the App:

User selects "Insurance Invoice". -> System activates "Insurance Policy".
User selects Customer (who is linked to AXA). -> System detects Partner is AXA.
PriceCalculator searches:
Is there a price for Policy="Insurance" AND Partner="AXA"? YES (50).
You don't need to change the database. The current structure already supports this "Matrix" perfectly. You just need to add the rules in the administration panel.



Here is the best way to organize them:

Invoice Type	Customer (Who is standing in front of you?)	Partner (Who is paying/The Entity?)
Cash	The Patient / Buyer	None
Insurance	The Patient (e.g., "Ahmed")	The Insurance Co. (e.g., "Bupa")
Corporate	The Employee (e.g., "Sarah")	The Company (e.g., "Aramco")
Wholesale	The Representative / Driver	The Optical Shop (e.g., "Crystal Optics")
So:

Customer = Always the Person.
Partner = Always the Company / Organization.
This keeps your data clean. If "Crystal Optics" buys 50 frames, the Partner is "Crystal Optics", and the Customer could be the driver or just a generic "Wholesale Customer".

Next: I will check the code that Saves the Order to make sure it actually sends this Partner information to the backend.