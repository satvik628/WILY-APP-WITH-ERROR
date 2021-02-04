import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, KeyboardAvoidingView, ToastAndroid } from 'react-native';

import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config.js';

export default class TransactionScreen extends React.Component {

    constructor() {
        super();
        this.state = {
            hasCameraPermissions: null,
            scanned: false,
            scannedBookId: '',
            scannedStudentId: '',
            buttonState: 'normal',
            transactionMessage: '',
        }
    }

    getCameraPermissions = async (id) => {

        const { status } = await Permissions.askAsync(Permissions.CAMERA);

        this.setState({
            hasCameraPermissions: status === "granted",
            buttonState: id,
            scanned: false,
        });
    }

    handleBarCodeScanned = async ({ type, data }) => {

        const { buttonState } = this.state;

        if (buttonState === "BookId") {
            this.setState({
                scanned: true,
                scannedBookId: data,
                buttonState: 'normal'
            });
        } else if (buttonState === "StudentId") {
            this.setState({
                scanned: true,
                scannedStudentId: data,
                buttonState: 'normal'
            });
        }
    }

    handleTransaction = async () => {
        var transactionType = await this.checkBookEligibility();

        if (transactionType) {
            alert("Oh !This book is not available in the library");
            this.setState({
                scannedBookId: '',
                scannedStudentId: '',
            })

        } else if (transactionType === "Issue") {
            var isStudentEligible = await checkStudentEligibilityforBookIssue();

            if (isStudentEligible) {
                this.initiateBookIssue();
                alert("Bood issued to the student ");
            }

        } else if (transactionType === "Return") {
            var isStudentEligible = await checkStudentEligibilityforBookReturn();

            if (isStudentEligible) {
                this.initiateBookReturn();
                alert("Bood returned by the student ");
            }

        }


        /* console.log("handle")
         var transactionMessage="";
 
         db.collection('books').doc(this.state.scannedBookId).get().then((doc)=>{
             console.log("data ",doc.data());
             var book= doc.data();
             if(book.bookAvailability){
                this.initiateBookIssue();
                transactionMessage=" Yeah ! Book is Issued  : )"
             }
             else{
                 this.initiateBookReturn();
                transactionMessage="Congrats! Book is returned"
             }
             this.setState({
                 transactionMessage:transactionMessage
             })
 
 
         })
 
         //ToastAndroid.show(transactionMessgae,ToastAndroid.SHORT);
         alert(this.state.transactionMessage)
 */
    }

    checkBookEligibility = async () => {
        console.log("inside check book")
        const bookRef = await db.collection("books").where("bookId", "==", this.state.scannedBookId).get()
        var transactionType = "";
       // console.log(bookRef.docs.data())
        if (bookRef.docs.length === 0) {
            transactionType = true;
        } else {
            bookRef.docs.map((doc) => {
                var book = doc.data();
                if (book.bookAvailability) {
                    transactionType = "Issue"
                } else {
                    transactionType = "Return"
                }
            })
        }

        return transactionType;
    }

    checkStudentEligibilityforBookIssue = async () => {
        const studentRef = await db.collection("students").where("studentId", "==", this.state.scannedStudentId).get()
        var isStudentEligible = "";

        if (studentRef.docs.length == 0) {
            isStudentEligible = false;
            alert("The student does not exist in the database")
            this.setState({
                scannedBookId: '',
                scannedStudentId: '',
            })

        } else {
            studentRef.docs.map((doc) => {
                var student = doc.data();
                if (student.numberOfBooksIssued < 2) {
                    isStudentEligible = true;
                } else {
                    isStudentEligible = false;
                    alert("The student has 2 books issued already")
                    this.setState({
                        scannedBookId: '',
                        scannedStudentId: '',
                    })

                }
            })

        }

        return isStudentEligible;
    }


    checkStudentEligibilityforBookReturn = async () => {
        const transactionRef = await db.collection("transaction").where("bookId", "==", this.state.scannedBookId).limit(1).get();
        var isStudentEligible = ""

        transactionRef.docs.map((doc) => {
            var lastBookTransaction = doc.data();
            if (lastBookTransaction.studentId === this.state.scannedStudentId) {
                isStudentEligible = true;
            }
            else {
                isStudentEligible = false;
                this.setState({
                    scannedBookId: '',
                    scannedStudentId: '',
                })
            }
        })
        return isStudentEligible;
    }



    initiateBookIssue = async () => {

        db.collection('transaction').add({
            studentId: this.state.scannedStudentId,
            bookId: this.state.scannedBookId,
            date: firebase.firestore.Timestamp.now().toDate(),
            transactionType: "Issue"
        });

        db.collection('books').doc(this.state.scannedBookId).update({
            bookAvailability: false,
        })

        db.collection('students').doc(this.state.scannedStudentId).update({
            numberOfBooksIssued: firebase.firestore.FieldValue.increment(1)
        })

        this.setState({
            scannedBookId: '',
            scannedStudentId: '',
        })
    }
    initiateBookReturn = async () => {

        db.collection('transaction').add({
            studentId: this.state.scannedStudentId,
            bookId: this.state.scannedBookId,
            date: firebase.firestore.Timestamp.now().toDate(),
            transactionType: "Return"
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            bookAvailability: true,
        })
        db.collection('students').doc(this.state.scannedStudentId).update({
            numberOfBooksIssued: firebase.firestore.FieldValue.increment(-1)
        })

        this.setState({
            scannedBookId: '',
            scannedStudentId: '',
        })

    }

    render() {

        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;


        if (hasCameraPermissions && buttonState !== "normal") {
            return (
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                />
            )
        }

        else if (buttonState === "normal") {
            return (
                <KeyboardAvoidingView style={styles.container} behaviour="padding" enabled >
                    <Image
                        source={require("../assets/booklogo.jpg")}
                        style={{ alignSelf: 'center', width: 100, height: 100 }}
                    />
                    <Text style={{ fontSize: 36, alignSelf: 'center' }}>Wireless Library App</Text>
                    <View>
                        <TextInput
                            style={{ width: 800, alignSelf: 'center', height: 40, borderRadius: 140, textAlign: 'center', marginTop: 100, border: 'solid' }}
                            placeholder="Book Id"
                            onChangeText={(text) => {
                                this.setState({
                                    scannedBookId: text
                                })
                            }}
                            value={this.state.scannedBookId}
                        />
                        <TouchableOpacity onPress={() => {
                            this.getCameraPermissions("BookId")
                        }}><Text style={styles.scanButtonText}>                     Scan</Text></TouchableOpacity>
                    </View>
                    <View>
                        <TextInput
                            style={{ width: 800, alignSelf: 'center', height: 40, borderRadius: 140, textAlign: 'center', marginTop: 75, border: 'solid' }}
                            placeholder="Student Id"
                            value={this.state.scannedStudentId}
                            onChangeText={(text) => {
                                this.setState({
                                    scannedStudentId: text
                                })
                            }}
                        />
                        <TouchableOpacity onPress={() => {
                            this.getCameraPermissions("StudentId")
                        }}><Text style={styles.scanButtonText}>                    Scan</Text></TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => {
                        this.handleTransaction()
                    }}>

                        <Text style={styles.submitButtonText}>                                  SUBMIT</Text>

                    </TouchableOpacity>
                </KeyboardAvoidingView>

            )
        }

    }

}


const styles = StyleSheet.create({

    scanButton: {
        backgroundColor: 'red',
        color: 'white',
        width: 360,
    },
    scanButtonText: {
        backgroundColor: 'black',
        color: 'white',
        width: 360,
        borderRadius: 20,
        height: 40,
        fontSize: 28,
        alignSelf: 'center',
        marginTop: 15,
    },
    submitButtonText: {
        backgroundColor: 'blue',
        color: 'white',
        width: 360,
        borderRadius: 20,
        height: 30,
        fontSize: 18,
        alignSelf: 'center',
        marginTop: 10,
    },
    container: {
        marginTop: 10,

    }

})