import 'package:flutter/material.dart';
import 'package:frontend/core/features/auth_module.dart';
import 'package:frontend/core/features/checksignin.dart';
import 'package:frontend/core/features/signin.dart';

class Home extends StatelessWidget {
  const Home({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Home')),
      body: Center(
        child: Column(
          children: [
            Text(
              'Welcome to the Home Page',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            ElevatedButton(
      onPressed: () async {
        // Send the logout request to the server
        var result = await API().logout();

        if (result['statusCode'] == 200) {
          // If logout is successful, navigate to the SignIn page
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(result['message'] ?? 'Successfully logged out')),
          );
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => signIn()),  // Navigate to the login screen
          );
        } else {
          // Handle error if logout fails
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(result['error'] ?? 'Error logging out')),
          );
        }
      },
      child: Text('Log Out', style: TextStyle(color: Colors.blue)),
    ),
          ],
        ),
      ),
    );
  }
}
