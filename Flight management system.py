import pandas as pd

import mysql.connector as sql

connection = sql.connect(host='localhost', user='root', password='Pr10032006akhar', database='flight_management')
if connection.is_connected():
    print('Connected Succefully !! ')


# Designing Menu
def menu():
    print()
    print('*********************************************************************************************')
    print('Flight Management System Project'.center(50))
    print('*' * 126)
    print("1. Create Table passenger")
    print("2. Add new passenger Detail")
    print("3. Create Table Classtype")
    print("4. Add new Class Type Detail")
    print("5. Create Table Food")
    print("6. Add Food Item Detail")
    print("7. Show Food menu ")
    print("8. Search by Food Item Name")
    print("9. Delete Food Item Detail if no more avialable")
    print("10. Revise Rates of Food Items ")
    print("11. Create Table Luggage")
    print("12. Add New Charges for more weights")
    print("13. Show all Types of Seats and their Ticket Price")
    print("14. Show type of seats passenger has chosen and it's Ticket Price")
    print("15. If Extra Luggage then it's Bill")
    print("16. If food item ordered then it's Bill")
    print('*********************************************************************************************')
    print("*" * 126)


menu()

    # Creating a table
def create_passenger():
    c1 = connection.cursor()
    c1.execute('Create table if not exists passenger(name varchar(25), address varchar (25), mobile int(11), reg_date date, source Varchar(25), destination Varchar(25));')
    print('Table passenger Created !!')

def add_passenger():
    c1=connection.cursor()
    L = []
    name = input("ENTER NAME:")
    L.append(name)
    address = input("ENTER ADDRESS: ")
    L.append(address)
    mobile = input("ENTER MOBILE:")
    L.append(mobile)
    rdate = input("ENTER RESERVATION DATE:")
    L.append(rdate)
    source = input("ENTER SOURCE:")
    L.append(source)
    destination = input("ENTER DESTINATION:")
    L.append(destination)
    pas = (L)
    sql = "insert into passenger (name, address, mobile, reg_date, source, destination)values(%s,%s, %s, %s, %s, %s)"
    c1.execute(sql,pas)
    connection.commit()
    print('Record of passenger Inserted !!')


def create_classtype():
    c1 = connection.cursor()
    c1.execute('Create table if not exists classtype(S_No int(5), Classtype Varchar(25), Rate int(11));')
    print('Table Classtype Created !!')


def add_classtype():
    c1 = connection.cursor()
    df = pd.read_sql("select * from classtype", connection)
    print(df)
    L = []
    S_No = input("ENTER Serial No.:")
    L.append(S_No)
    itemname = input("ENTER NAME OF CLASS TYPE:")
    L.append(itemname)
    Rate = input("ENTER RATE PER TICKET:")
    L.append(Rate)
    ct = (L)
    sql = "insert into classtype(S_No, Classtype, Rate)values(%s,%s, %s)"
    c1.execute(sql, ct)
    connection.commit()
    print('Record inserted in classtype !!')


def create_food():
    c1 = connection.cursor()
    c1.execute('create table if not exists food(sno int(5), itemname Varchar(25), rate int(11));')
    print('table food created !!')


def add_food():
    c1 = connection.cursor()
    df = pd.read_sql("select * from food", connection)
    print(df)
    L = []
    sno = input("ENTER Serial No.:")
    L.append(sno)
    itemname = input("ENTER NAME OF FOOD ITEM:")
    L.append(itemname)
    rate = input("ENTER RATE OF FOOD ITEM PER PIECE:")
    L.append(rate)
    f = (L)
    sql = "insert into food(sno, itemname, rate) values (%s, %s, %s)"
    c1.execute(sql, f)
    connection.commit()
    print('Record inserted in food')

def showfoodmenu():
    print('ALL FOOD ITEMS availabe')
    df = pd.read_sql("select from food", connection)
    print(df)

def search_byfooditem():
    print('ALL FOOD ITEMS availabe')
    df=pd.read_sql("select*from food", connection)
    print(df)
    print('Search RATE OF FOOD ITEM by entering FOOD ITEM NO.')
    a=float(input("Enter FOOD ITEM NO. :"))
    qry="select*from food where sno=%s; "%(a,)
    df=pd.read_sql(qry, connection)
    print(df)

def delete_food():
    print('Before any changes in Food Menu')
    df=pd.read_sql("select * from food", connection)
    print(df)
    print()
    print()
    mc = connection.cursor()
    mc.execute("delete from food where itemname='Pizza'")
    print("Record Deleted")
    df=pd.read_sql("select * from food", connection)
    print(df)
    connection.commit()

def revise_foodrate():
    print("Before any Changes in the Rates")
    df = pd.read_sql("select * from food", connection)
    print(df)
    mc = connection.cursor()
    mc.execute("update food set rate arate+10 where itemname='COFFEE'")
    df = pd.read_sql("select * from food", connection)
    print(df)
def create_luggage():
    c1=connection.cursor()
    c1.execute('create table if not exists Luggage (S_No int(5), Weight Varchar(25), Rate Int(11) ')
    print('table Luggage created')

def add_luggage():
    c1=connection.cursor()
    df=pd.read_sql("select * from Luggage",connection)
    print(df)
    L=[]
    sno=input("ENTER Serial No.: ")
    L.append(sno)
    weight=input("ENTER WEIGHT OF LUGGAGE : ")
    L.append(weight)
    rate = input("Enter Rate of Luggage : ")
    L.append(rate)
    lug=(L)
    sql = "insert into luggage(S_NO, Weight, Rate) values(%s,%s,%s)"
    c1.execute(sql,lug)
    connection.commit()
    print('Record inserted in Luggage')

def showticketprice():
    print('ALL records of Types of Seats availabe')
    df=pd.read_sql("select * from classtype", connection)
    print(df)

def ticketreservation():
    print ("WE HAVE THE FOLLOWING SEAT TYPES FOR YOU:-")
    print("1. FIRST CLASS RS 6000 Per PERSON")
    print("2. BUSINESS CLASS RS 11000 Per PERSON")
    print ("3. ECONOMY CLASS RS 5000 Per PERSON")
    print ("4. King Room RS 6000 Per PERSON")
    x=int(input("ENTER YOUR CHOICE of TICKET PLEASE->"))
    n=int(input("HOW MANY TICKETS YOU NEED: "))
    if (x == 1):
        print ("YOU HAVE Chosen FIRST CLASS")
        s=6000*n
    elif (x == 2):
        print("YOU HAVE Chosen BUSINESS CLASS")
        s = 11000 * n
    elif (x == 3):
        print("YOU HAVE Chosen ECONOMY CLASS")
        s = 5000 * n
    else:
        print("PLEASE CHOOSE A ROOM")
    print("your TOTAL TICKET PRICE is =", s, "\n")
def luggagebill ():
    x = int(input("Enter Serial No. of Weight of Extra Luggage ---> "))
    if (x==1):
        print("Ypu have 20Kg Extra")
        s = 2000
    elif (x==2) :
        print("You have 25Kg Extra")
        s = 3500
    elif (x==3):
        print("You have 30Kg Extra")
        s = 4000
    elif (x == 4):
        print("You have 35Kg Extra")
        s = 5000
    elif (x == 3):
        print("You have 40Kg Extra")
        s = 6000
    else:
        print("PLEASE CHOOSE A CORRECT SERIAL NUMBER!!")
    print("Your cost of Extra Luggage is", s)

def foodbill():
    print('ALL Food Items available')
    df=pd.read_sql("select from food", connection)
    print(df)
    c = int(input("Order your ITEM No.:"))
    d = int(input("Enter the quantity:"))
    if (c == 1):
        s= 20*d
    elif (c==2):
        s= 30*d
    elif (c == 3):
        s = 60*d
    elif (c==4):
        s=100*d
    elif (c==5):
        s=150*d
    else:
        print("Invalid Option")
    print("Total Food Bill = Rs", s, "\n")

opt =""
opt=int(input("Enter Your Choice : "))
if opt==1:
    create_passenger()

elif opt==2:
    add_passenger()
elif opt==3:
    create_classtype()
elif opt==4:
    add_classtype()
elif opt==5:
    create_food()
elif opt==6:
    add_food()
elif opt==7:
    showfoodmenu()
elif opt==8:
    search_byfooditem()
elif opt==9:
    delete_food()
elif opt==10:
    revise_foodrate()
elif opt==11:
    create_luggage()
elif opt==12:
    add_luggage()
elif opt==13:
    showticketprice()
else:
    print("Invalid Option")
    


