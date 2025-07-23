import 'dart:convert';
import 'dart:html' as html;

import 'package:http/http.dart' as http;
import 'package:http/browser_client.dart' as browser_http;

class API {
  final basePath = 'http://192.168.0.192:3000';
  //static final http.Client _client = http.Client();
  // Helper method to get cookies from browser
  // String _getCookieHeader() {
  //   return html.document.cookie ?? '';
  // }

  Future<Map<String, dynamic>> createUser(Map data) async {
    final url = Uri.parse('$basePath/create');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(data),
      );
      final statusCode = response.statusCode;
      try {
        if (statusCode == 200 || statusCode == 201) {
          Map<String, dynamic> decoded = Map<String, dynamic>.from(
            jsonDecode(response.body),
          );
          decoded['statusCode'] = statusCode;
          return decoded;
        } else {
          return {'error': 'something not good', 'statusCode': statusCode};
        }
      } catch (e) {
        return {
          'error': 'Invalid Json response from server',
          'statusCode': statusCode,
        };
      }
    } catch (e) {
      return {'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> login(Map<String, dynamic> data) async {
    final url = Uri.parse('$basePath/login');
    // final client = browser_http.BrowserClient(); // ✅ Fixed name
    // client.withCredentials = true; // ✅ Allow cookies for Web
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(data),
      );
      final statusCode = response.statusCode;
      try {
        if (statusCode == 200 || statusCode == 201) {
          Map<String, dynamic> decoded = Map<String, dynamic>.from(
            (jsonDecode(response.body)),
          );
          decoded['statusCode'] = statusCode;
          // Store login state in browser storage for web
          if (decoded['user'] != null) {
            html.window.localStorage['user'] = jsonEncode(decoded['user']);
            html.window.localStorage['isLoggedIn'] = 'true';
          }

          return decoded;
        } else {
          return {'error': 'something not good', 'statusCode': statusCode};
        }
      } catch (e) {
        return {
          'error': 'Invalid JSON response from server',
          'statusCode': statusCode,
        };
      }
    } catch (e) {
      return {'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> logout() async {
    final url = Uri.parse('$basePath/logout');

    try {
      print('Logging out...');

      final response = await http.get(
        url,
        headers: {'Accept': 'application/json'},
      );

      print('Logout response status: ${response.statusCode}');
      print('Logout response body: ${response.body}');

      if (response.statusCode == 200) {
        // Clear local storage
        html.window.localStorage.remove('user');
        html.window.localStorage.remove('isLoggedIn');

        return {
          'statusCode': response.statusCode,
          'message': 'Logged out successfully',
        };
      } else {
        return {
          'error': 'Something went wrong during logout',
          'statusCode': response.statusCode,
        };
      }
    } catch (e) {
      print('Logout error: $e');
      return {'error': 'Network error: ${e.toString()}'};
    }
  }

  // Helper method to check if user is logged in (client-side check)
  bool isLoggedIn() {
    return html.window.localStorage['isLoggedIn'] == 'true';
  }

  // Helper method to get stored user data
  // Map<String, dynamic>? getStoredUser() {
  //   final userStr = html.window.localStorage['user'];
  //   if (userStr != null) {
  //     try {
  //       return jsonDecode(userStr);
  //     } catch (e) {
  //       return null;
  //     }
  //   }
  //   return null;
  // }

  // Future<Map<String, dynamic>> whoAmI() async {
  //   final url = Uri.parse('$basePath/whoami');

  //   try {
  //     print('Checking whoami status...');

  //     final response = await _client.get(
  //       url,
  //       headers: {'Accept': 'application/json'},
  //     );

  //     print('WhoAmI response status: ${response.statusCode}');
  //     print('WhoAmI response body: ${response.body}');
  //     print('WhoAmI response headers: ${response.headers}');

  //     try {
  //       Map<String, dynamic> decoded = jsonDecode(response.body);
  //       decoded['statusCode'] = response.statusCode;
  //       return decoded;
  //     } catch (e) {
  //       return {
  //         'error': 'Invalid JSON response',
  //         'statusCode': response.statusCode,
  //         'details': e.toString(),
  //       };
  //     }
  //   } catch (e) {
  //     print('WhoAmI error: $e');
  //     return {'error': 'Network error: ${e.toString()}'};
  //   }
  // }
}
