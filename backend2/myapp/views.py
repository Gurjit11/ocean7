from .models import MobileData
import json
from django.http import JsonResponse
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
import random
from .data.cards import cards
import re
from .mongo_helper import MongoDBHelper
from pymongo import MongoClient
import urllib.parse
import pymongo
import time
import datetime
joker=""

@csrf_exempt
def receive_data(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            key = data.get('key')
            mobile_data = data.get('data')

            # Save data to the database
            MobileData.objects.create(key=key, data=mobile_data)

            return JsonResponse({'status': 'success', 'message': 'Data received and saved!'})
        
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format'}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Only POST requests are allowed'}, status=405)


def get_data(request):
    if request.method == 'GET':
        data = MobileData.objects.all().values()
        return JsonResponse(list(data), safe=False)
    return JsonResponse({'status': 'error', 'message': 'Only GET requests are allowed'}, status=405)



# Global variable for card state (or store this in a database)
cardState = {
    'revealedCardIds': [],
    'currentIndex': [0, 0, 0],  # For sections 0, 1, 2
    'assignedCardIndices': [[], [], []],
    'displayedCards': [[], [], []],
    'jokerCard': None
}


@csrf_exempt  # Disable CSRF protection for this view
def assign_card_to_section(request, section_id):
    try:
        section_id = int(section_id)  # Ensure section_id is an integer
        if section_id < 0 or section_id > 2:
            return JsonResponse({"error": "Invalid section ID"}, status=400)

        # Check if all cards have been revealed for the section
        if len(cardState['assignedCardIndices'][section_id]) >= len(cards):
            return JsonResponse({"error": "All cards assigned in this section"}, status=400)

        # Get available cards that have not been revealed
        available_cards = [card for card in cards if card['id'] not in cardState['revealedCardIds']]

        if not available_cards:
            return JsonResponse({"error": "No cards left to assign"}, status=400)

        # Randomly select a card
        selected_card = random.choice(available_cards)
        
        # Update the cardState
        cardState['revealedCardIds'].append(selected_card['id'])
        cardState['assignedCardIndices'][section_id].append(selected_card['id'])
        cardState['displayedCards'][section_id].append(selected_card)

        return JsonResponse({
            "success": True,
            "card": selected_card,
            "section_id": section_id
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt  # Disable CSRF protection for this view
def reveal_joker_card(request):
    try:
        # Check if jokerCard is already revealed
        if cardState['jokerCard'] is not None:
            return JsonResponse({"error": "Joker card has already been revealed"}, status=400)


        available_cards = [card for card in cards if card['id'] not in cardState['revealedCardIds']]

       
        # Randomly select a card
        selected_card = random.choice(available_cards)
        

        if not selected_card:
            return JsonResponse({"error": "No joker cards left to assign"}, status=400)

        
        # Update the cardState
        cardState['revealedCardIds'].append(selected_card['id'])
        cardState['jokerCard'] = selected_card

        return JsonResponse({
            "success": True,
            "jokerCard": selected_card
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt  # Disable CSRF protection for this view
# def reset_card_state(request):
#     if request.method == 'POST':
#         try:
#             global cardState
#             # Clear the current state values
#             cardState['revealedCardIds'] = []
#             cardState['currentIndex'] = [0, 0, 0]
#             cardState['assignedCardIndices'] = [[], [], []]
#             cardState['displayedCards'] = [[], [], []]
#             cardState['jokerCard'] = None

#             return JsonResponse({
#                 'status': 'success',
#                 'message': 'Card state has been reset!',
#                 'cardState': cardState  # Return the cleared state
#             })

#         except Exception as e:
#             return JsonResponse({"error": str(e)}, status=500)

#     return JsonResponse({'status': 'error', 'message': 'Only POST requests are allowed'}, status=405)

@csrf_exempt  # Disable CSRF protection for this view
def update_card_state(request):
    if request.method == 'POST':
        try:
            # Simply return the current cardState
            return JsonResponse({
                'status': 'success',
                'cardState': cardState
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
    return JsonResponse({'status': 'error', 'message': 'Only POST requests are allowed'}, status=405)


@csrf_exempt  # Disable CSRF protection for this view
def assign_card_to_section2(request, section_id):
    try:
        section_id = int(section_id)  # Ensure section_id is an integer
        if section_id < 0 or section_id > 2:
            return JsonResponse({"error": "Invalid section ID"}, status=400)

        # Check if all cards have been revealed for the section
        if len(cardState['assignedCardIndices'][section_id]) >= len(cards):
            return JsonResponse({"error": "All cards assigned in this section"}, status=400)

        # Get available cards that have not been revealed
        available_cards = [card for card in cards if card['id'] not in cardState['revealedCardIds']]

        if not available_cards:
            return JsonResponse({"error": "No cards left to assign"}, status=400)

        # Randomly select a card
        selected_card = random.choice(available_cards)
        
        # Update the cardState
        cardState['revealedCardIds'].append(selected_card['id'])
        cardState['assignedCardIndices'][section_id].append(selected_card['id'])
        cardState['displayedCards'][section_id].append(selected_card)

        # Extract joker card
        joker_card = cardState['jokerCard']
        if joker_card is None:
            return JsonResponse({"error": "No joker card revealed"}, status=400)

        # Define a regex pattern to extract the card number
        # pattern = r"<Card:([2-9TJQKA])[HSDC]>"  # Updated to include face cards and numbers

        # def extract_card_number(card_name):
        #     # Use regex to find the card number
        #     match = re.search(pattern, card_name)
        #     if match:
        #         return match.group(1)  # Return the captured group (the card number)
        #     return None

        joker_card_number = joker_card['name']
        revealed_card_number = selected_card['name']

        # Debug: Print the extracted joker and revealed card numbers
        print(f"Joker Card Number: {joker_card_number}, Revealed Card Number: {revealed_card_number}")

        # Check if the joker card number matches the revealed card number
        is_match = joker_card_number == revealed_card_number

        # Debug: Print if there was a match
        print(f"Match Found: {is_match}")

        # Prepare the response
        result = {
            "success": True,
            "card": selected_card,
            "section_id": section_id,
            "joker_card": joker_card,
            "match": is_match,  # Indicate if the card matches the joker
            "message": "Match found!" if is_match else "No match"
        }

        return JsonResponse(result)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    


@csrf_exempt
def check_for_new_documents(request):
    try:
        value=""
        
        mongo_helper = MongoDBHelper()
        print(mongo_helper)
        for x in mongo_helper.collection.find():
            value=(x.get('value'))
        print(value)
        
        return JsonResponse({
            "success": True,
            "documents": value
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    


@csrf_exempt  # Disable CSRF protection for this view
def assign_card_to_section3(request, section_id):
    try:
        # Ensure section_id is an integer
        section_id = int(section_id)
        if section_id < 0 or section_id > 2:
            return JsonResponse({"error": "Invalid section ID"}, status=400)

        # Check if all cards have been revealed for the section
        if len(cardState['assignedCardIndices'][section_id]) >= len(cards):
            return JsonResponse({"error": "All cards assigned in this section"}, status=400)

        # Fetch the card value from MongoDB
        # mongo_helper = MongoDBHelper()
        # fetched_card_value = mongo_helper.get_latest_document_value()
        value=""
        
        mongo_helper = MongoDBHelper()
        for x in mongo_helper.collection.find():
            value=(x.get('value'))
        print(value)
        
        # return JsonResponse({
        #     "success": True,
        #     "documents": value
        # })
        
    
        if not value:
            return JsonResponse({"error": "No card value found in MongoDB"}, status=500)

        # Search for the card with the fetched value in the available cards
        # available_cards = [card for card in cards if card['id'] not in cardState['revealedCardIds']]
        # selected_card = None

        # for card in available_cards:
        #     if card['name'] == fetched_card_value:  # Assuming 'name' is in the format '<Card:XX>'
        #         selected_card = card
        #         break

        # if not selected_card:
        #     return JsonResponse({"error": "No matching card found for the fetched value"}, status=500)

        # Update the cardState
        cardState['revealedCardIds'].append(value)
        cardState['assignedCardIndices'][section_id].append(value)
        cardState['displayedCards'][section_id].append(value)

        # Respond with the selected card
        return JsonResponse({
            "success": True,
            "card": value,
            "section_id": section_id
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)




mongo_helper = MongoDBHelper()

card_assignment_counter = 0

@csrf_exempt  # Disable CSRF protection for this view
def assign_card_directly(request):
    global card_assignment_counter
    try:
        # Fetch the latest card value from MongoDB
        value = None
        latest_document = mongo_helper.collection.find().sort([('_id', -1)]).limit(1)  # Sort by _id to get the latest document
        for doc in latest_document:
            value = doc.get('value')
        
        if not value:
            return JsonResponse({"error": "No card value found in MongoDB"}, status=500)

        # Check if the card has already been revealed
        if value in cardState['revealedCardIds']:
            return JsonResponse({"error": "Card already revealed"}, status=400)

        # Calculate section_id based on the counter
        section_id = 1 if card_assignment_counter % 2 == 1 else 0

        # Increment the card assignment counter
        card_assignment_counter += 1

        # Check if all cards have been revealed for the section
        if len(cardState['assignedCardIndices'][section_id]) >= len(cards):
            return JsonResponse({"error": "All cards assigned in this section"}, status=400)
        
        print(value)

        # Update the cardState with the assigned card
        cardState['revealedCardIds'].append(value)
        cardState['assignedCardIndices'][section_id].append(value)
        cardState['displayedCards'][section_id].append(value)
        print(cardState)

        # Respond with the selected card and the section it was assigned to
        return JsonResponse({
            "success": True,
            "card": value,
            "section_id": section_id,
            "state":cardState

        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)











import re
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt  # Disable CSRF protection for this view
def assign_card_directly2(request):
    global card_assignment_counter
    try:
        # Fetch the latest card value from MongoDB
        value = None
        latest_document = mongo_helper.collection.find().sort([('_id', -1)]).limit(1)  # Sort by _id to get the latest document
        for doc in latest_document:
            value = doc.get('value')
        
        if not value:
            return JsonResponse({"error": "No card value found in MongoDB"}, status=500)

        # Check if the card has already been revealed
        if value in cardState['revealedCardIds']:
            return JsonResponse({"error": "Card already revealed"}, status=400)

        # Extract the number using regex from the card value (assuming it contains a number)
        card_number_match = re.search(r'\d+', value)  # Extract number from the card value
        card_number = card_number_match.group() if card_number_match else None
        
        # Check if the Joker card exists and compare the number
        if cardState.get('jokerCard'):
            print("state")
            print(cardState.get('jokerCard'))

            
            joker_card_number_match = re.search(r'\d+', cardState['jokerCard'])  # Assuming 'jokerCard' contains value
            joker_card_number = joker_card_number_match.group() if joker_card_number_match else None
            print(f"Joker card number: {joker_card_number}")

            if card_number and joker_card_number and card_number == joker_card_number:
                print(f"Card number {card_number} matches Joker card number.")
                # If the card number matches the Joker card, we still proceed to determine the winner by section_id

        # Calculate section_id based on the counter
        section_id = 1 if card_assignment_counter % 2 == 1 else 0

        # Increment the card assignment counter
        card_assignment_counter += 1

        # Check if all cards have been revealed for the section
        if len(cardState['assignedCardIndices'][section_id]) >= len(cards):
            return JsonResponse({"error": "All cards assigned in this section"}, status=400)

        # Extract the first character of the card value
        first_character = value[0] if value else None
        print(f"First character of the card: {first_character}")

        # Update the cardState with the assigned card
        cardState['revealedCardIds'].append(value)
        cardState['assignedCardIndices'][section_id].append(value)
        cardState['displayedCards'][section_id].append(value)

        # Determine the outcome: "Bahar" if section_id is 1, "Andar" if section_id is 0
        if section_id == 1:
            outcome = "Bahar wins"
        else:
            outcome = "Andar wins"

        # If the card number matches the Joker card number, add that info to the outcome
        if card_number and joker_card_number and card_number == joker_card_number:
            outcome += " (Joker card number matched)"

        # Respond with the selected card, section it was assigned to, and the outcome
        return JsonResponse({
            "success": True,
            "card": value,
            "section_id": section_id,
            "outcome": outcome,
            "state": cardState,
            "first_character": first_character
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def reset_card_state(request):
    try:
        # Reset the cardState structure
        cardState['revealedCardIds'] = []
        cardState['assignedCardIndices'] = [[], []]
        cardState['displayedCards'] = [[], []]
        cardState['jokerCard'] = None

        # Respond with the updated (reset) cardState
        return JsonResponse({
            "success": True,
            "message": "Card state has been successfully reset",
            "state": cardState
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    



card_assignment_counter = 1
card_assignment_counter2 = 1


# Function to extract number from the card name using regex
def extract_number_from_name(card_name):
    match = re.match(r'(\d+|[JTQKA])', card_name)
    return match.group(0) if match else None

@csrf_exempt
def assign_card_to_section_A(request):
    global joker
    global card_assignment_counter

    try:
        # POST Request: Assign a card to a section
        if request.method == "POST":
            print(f"{card_assignment_counter}: card_assignment_counter")

            # Fetch the latest unread card value from MongoDB
            value = None
            latest_document = mongo_helper.collection.find({"isRead": 0})  # Fetch all unread documents
            for doc in latest_document:
                section_id = card_assignment_counter % 2
                card_assignment_counter += 1
                value = doc.get('value')
                print(f"Card value fetched: {value}")
                card_value = extract_number_from_name(value)
                print(f"Extracted card value: {card_value}")

            if not value:
                return JsonResponse({"error": "No card value found in MongoDB"}, status=500)

            # Assign card and check if it's a joker
            if card_value == joker:
                result = f"{section_id} wins"
            else:
                result = "Card assigned, no match"

            # Update the document as read
            mongo_helper.collection.update_one(
                {"value": value, "isRead": 0},
                {"$set": {"isRead": 1}}
            )
            print(f"Updated card {value} with isRead: 1")

            # Respond with the assigned card and result
            return JsonResponse({
                "success": True,
                "card": card_value,
                "value": value,
                "section_id": section_id,
                "result": result,
                "joker": joker,
            })

        # PUT Request: Update the latest card value
        elif request.method == "PUT":
            try:
                # Parse the request body for the new value
                body = json.loads(request.body)
                print(f"Request body received: {body}")
                new_value = body.get("value")
                if not new_value:
                    return JsonResponse({"error": "New card value is required"}, status=400)

                # Fetch the latest document from MongoDB
                latest_document = mongo_helper.collection.find_one(sort=[("_id", -1)])  # Get the latest document by _id
                if not latest_document:
                    return JsonResponse({"error": "No documents found in MongoDB"}, status=404)

                # Update the latest document with the new value and reset isRead to 0
                mongo_helper.collection.update_one(
                    {"_id": latest_document["_id"]},  # Use the _id of the latest document
                    {"$set": {"value": new_value, "isRead": 0, "isRead2": 0}}
                )
                print(f"Updated latest document {latest_document['_id']} with value: {new_value} and reset isRead to 0")

                # Simulate assignment logic for the response
                section_id = (card_assignment_counter-1) % 2  # Keep section_id logic consistent
                card_assignment_counter -= 1
                print("card_assignment_counter",card_assignment_counter)
                print("section_id",section_id)
                card_value = extract_number_from_name(new_value)

                # Check if the new card matches the joker
                if card_value == joker:
                    result = f"{section_id} wins"
                else:
                    result = "Card assigned, no match"

                # Respond with the updated card details and consistent response structure
                return JsonResponse({
                    "success": True,
                    "card": card_value,
                    "value": new_value,
                    "section_id": section_id,
                    "result": result,
                    "joker": joker,
                })

            except Exception as e:
                print(f"Error in PUT request: {str(e)}")
                return JsonResponse({"error": str(e)}, status=500)

        # Unsupported Request Methods
        else:
            return JsonResponse({"error": "Unsupported HTTP method"}, status=405)

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def assign_card_to_player(request):
    global joker
    global card_assignment_counter2
    print("NICE")

    try:
        
        # print(f"{card_assignment_counter2}:card_assignment_counter")
        # Fetch the latest card value from MongoDB
        value = None
        latest_document = mongo_helper.collection.find({"isRead2":0})  # Fetch the latest document
        for doc in latest_document:
            section_id = card_assignment_counter2 % 2
            card_assignment_counter2 += 1
            value = doc.get('value') 
            print(value)
            card_value=extract_number_from_name(value)
            print(card_value)
             # Assuming 'value' is the card name or number

        if not value:
            return JsonResponse({"error": "No card value found in MongoDB"}, status=500)

       
        # # Check if all cards for the section have already been assigned
        # if len(cardState['assignedCardIndices'][section_id]) >= len(cards) // 2:  # Assuming each section gets half the cards
        #     return JsonResponse({"error": "All cards assigned in this section"}, status=400)

        # Extract the number from the joker card's name, if jokerCard is assigned
        print("joker is here "+str(joker))
        if card_value == joker:
            result = f"{section_id} wins"
            mongo_helper.db.wins.insert_one({
                "section_id": section_id,
                "result": "win"
            })
           
        else:
            result = "Card assigned, no match"

            


        mongo_helper.collection.update_one(
            {"value": value, "isRead2": 0},
            {"$set": {"isRead2": 1}}
        )
        print(f"Updated card card {value} with isRead2: 1")
        print(joker)

        # Respond with the assigned card and result
        return JsonResponse({
            "success": True,
            "card": card_value,
            "value": value,
            "section_id": section_id,
            "result": result,
            "joker":joker,
            # "state": cardState
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)




@csrf_exempt  # Disable CSRF protection for this view
def assign_joker_directly(request):
    try:
        # print("jbd1")
        # Check if jokerCard is already revealed
        if cardState['jokerCard'] is not None:
            print("joker revealed ")
            return JsonResponse({"error": "Joker card has already been revealed"}, status=400)

        # Fetch the latest card value from MongoDB
        value = None
        latest_document = mongo_helper.collection.find().sort([('_id', -1)]).limit(1)  # Fetch the latest document
        for doc in latest_document:
            value = doc.get('value')  
        
        if not value:
            print("error in value")
            return JsonResponse({"error": "No card value found in MongoDB"}, status=500)

        # Check if the card with the fetched value is already revealed
        if value in cardState['revealedCardIds']:
            return JsonResponse({"error": "Card already revealed as part of other assignments"}, status=400)

        # Search for the card with the fetched value in the available cards
        available_cards = [card for card in cards if card['id'] not in cardState['revealedCardIds']]
        selected_card = None

        for card in available_cards:
            if card['name'] == value:  # Assuming 'name' or some other attribute matches the MongoDB card value
                selected_card = card
                break

        if not selected_card:
            print("error in selected value")
            return JsonResponse({"error": "No matching joker card found for the fetched value"}, status=500)

        # Update the cardState
        cardState['revealedCardIds'].append(selected_card['id'])
        cardState['jokerCard'] = selected_card

        return JsonResponse({
            "success": True,
            "jokerCard": selected_card
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    



def get_client():
    username = urllib.parse.quote_plus("gurpreetkaur325612")
    password = urllib.parse.quote_plus("Init@123")
    MONGO_URI = f"mongodb+srv://{username}:{password}@cluster0.cp6fe.mongodb.net/gaj2"  # Specify your database here
    client = MongoClient(MONGO_URI)
    return client
@csrf_exempt
def get_joker_value(request):
    global joker
    client=get_client()
    print(client)
    db=client['gaj']
    collection=db['joker']
    latest_document = collection.find({},{"value":1,"_id":0})
    
    
    for x in latest_document:

        data=x
        joker=x.get('value')
        joker=extract_number_from_name(joker)
    print(joker)
    return JsonResponse({"data":data})
client=get_client()
db = client['gaj']
joker_collection = db['joker']
gaj2_collection = db['gaj2']




# Global timestamp variable to store the last POST request time
timestamp = None

@csrf_exempt
def reset_collections(request):
    global card_assignment_counter
    global card_assignment_counter2
    global timestamp

    if request.method == 'POST':
        try:
            # Reset the collections
            joker_collection.delete_many({})  # Add a filter if needed
            gaj2_collection.delete_many({})
            
            # Reset counters
            card_assignment_counter = 1
            card_assignment_counter2 = 1
            
            # Set the current timestamp
            timestamp = datetime.datetime.now()
            
            return JsonResponse({
                'success': True,
                'message': 'Collections reset successfully',
                'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S')
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})

    elif request.method == 'GET':
        if timestamp:
            return JsonResponse({
                'success': True,
                'message': 'reset',
                'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S')
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'No POST request has been made yet.'
            })

    else:
        return JsonResponse({'success': False, 'error': 'Invalid HTTP method'})


@csrf_exempt
def get_recent_wins(request):
    try:
        # Fetch the latest 50 documents from the 'wins' collection
        recent_wins = list(
            mongo_helper.db.wins.find({}, {"_id": 0}).sort("_id", pymongo.DESCENDING).limit(50)
        )

        if not recent_wins:
            return JsonResponse({"message": "No winning records found"}, status=404)

        # Return the recent wins data
        return JsonResponse({
            "success": True,
            "recent_wins": recent_wins
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
current_players = ["page1", "page2", "page3","page4", "page5", "page6"]
@csrf_exempt
def player_round(request):
    global current_players
    
    if request.method == 'POST':
        try:
            # Get the data from the request
            data = json.loads(request.body)
            players = data.get("players", [])

            # Ensure players are from allowed values
            valid_players = {"page1", "page2", "page3","page4", "page5", "page6"}
            current_players = [player for player in players if player in valid_players]

            return JsonResponse({"success": True, "message": "Player(s) set for the round", "players": current_players})
        
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid JSON format"}, status=400)

    elif request.method == 'GET':
        if current_players:  # Check if current_players is not empty
            return JsonResponse({"current_players": current_players})
        else:
            # If no players are set, default response
            return JsonResponse({"message": "No player playing"})

    else:
        return JsonResponse({"success": False, "message": "Invalid request method"}, status=405)
    
    
min_bet = 100
max_bet = 10000

@csrf_exempt
def set_bet(request):
    global min_bet, max_bet

    if request.method == 'POST':
        try:
            # Parse JSON data from request body
            data = json.loads(request.body)
            min_bet = data.get("min_bet")
            max_bet = data.get("max_bet")

            if min_bet is None or max_bet is None:
                return JsonResponse({"success": False, "message": "Both min_bet and max_bet are required"}, status=400)

            return JsonResponse({"success": True, "message": "Bets have been set", "min_bet": min_bet, "max_bet": max_bet})

        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid JSON format"}, status=400)

    return JsonResponse({"success": False, "message": "Invalid request method"}, status=405)

def get_bet(request):
    global min_bet, max_bet

    if request.method == 'GET':
        if min_bet is not None and max_bet is not None:
            return JsonResponse({"min_bet": min_bet, "max_bet": max_bet})
        else:
            return JsonResponse({"message": "Bets not set"})

    return JsonResponse({"success": False, "message": "Invalid request method"}, status=405)


pushing_active = True
shuffled_cards=[]
def push_to_mongo():
    """
    Pushes the card data to MongoDB every second until the flag is set to False.
    """
    global pushing_active

     # Shuffle the cards to ensure random order
    shuffled_cards = cards.copy()  # Create a copy to shuffle
    random.shuffle(shuffled_cards)

    first_card = shuffled_cards[0]
    print(f"First card: {first_card['name']}")
    joker_document = {
        "value": first_card["name"],
    }
    mongo_helper.db.joker.insert_one(joker_document)  # Push to the joker collection
    time.sleep(3)
    # Now push the rest of the cards to the main collection (gaj2)
    for card in shuffled_cards[1:]:  # Start from the second card
        if not pushing_active:  # Check if we should stop
            break  # Stop pushing data if the flag is False

        mongo_helper.collection.insert_one(
            {"value":  card["name"], "isRead": 0,"isRead2": 0},
        )
        time.sleep(3)  # Sleep for 1 second


@csrf_exempt
def start_push(request):
    """
    Starts pushing data to MongoDB every second.
    """
    global pushing_active
    pushing_active = True  # Set the flag to True to start pushing data
    push_to_mongo()  # Start pushing the data one by one
    return JsonResponse({"message": "Pushing started.", "first": shuffled_cards[0]["name"]})


@csrf_exempt
def stop_push(request):
    """
    Stops the process of pushing data to MongoDB.
    """
    global pushing_active
    global shuffled_cards
    shuffled_cards=[]
    pushing_active = False  # Set the flag to False to stop pushing data
    return JsonResponse({"message": "Pushing stopped.","cards":shuffled_cards})

def check_empty(request):
        is_empty = mongo_helper.collection.count_documents({}) == 0
        return JsonResponse({"empty": is_empty})


@csrf_exempt
def update_card(request):
    if request.method == 'POST':
            # Extract new value from request data
            body = json.loads(request.body)
            new_value = body.get("value")
            if not new_value:
                return JsonResponse({"error": "Missing 'value' in request data."}, status=status.HTTP_400_BAD_REQUEST)

            # Find the last document based on insertion order (assuming ObjectId sorting)
            last_document = mongo_helper.collection.find_one(sort=[("_id", -1)])

            if not last_document:
                return JsonResponse({"error": "No document found in the collection."}, status=status.HTTP_404_NOT_FOUND)

            # Update the last document
            result = mongo_helper.collection.update_one(
                {"_id": last_document["_id"]},  # Filter by the ID of the last document
                {
                    "$set": {
                        "value": new_value,
                        "isRead": 1,
                        "isRead2": 0
                    }
                }
            )

            if result.modified_count == 1:
                return JsonResponse({"message": "Document updated successfully."}, status=status.HTTP_200_OK)
            else:
                return JsonResponse({"error": "Failed to update the document."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        