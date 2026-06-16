with GNAT.Sockets; use GNAT.Sockets;
with Ada.Strings.Unbounded; use Ada.Strings.Unbounded;
with Ada.Strings.Maps;
with Ada.Text_IO;
with Ada.Exceptions;
with Ada.Strings.Fixed;
with Sort_Types; use Sort_Types;
with Bubble_Sort;
with Selection_Sort;
with Insertion_Sort;
with Quick_Sort;
with Merge_Sort;
with Heap_Sort;
with Topological_Sort;

package body API_Server is

   procedure Log (Msg : String) is
   begin
      Ada.Text_IO.Put_Line ("[Server] " & Msg);
   end Log;

   function Trim (S : String) return String is
   begin
      return Ada.Strings.Fixed.Trim (S, Ada.Strings.Both);
   end Trim;

   -- Custom lightweight JSON parser for arrays
   function Parse_Array (JSON : String) return Element_Vectors.Vector is
      Result : Element_Vectors.Vector;
      Start_Idx : Integer := -1;
      End_Idx : Integer := -1;
      Buffer : Unbounded_String;
   begin
      -- Locate square brackets [ and ]
      for K in JSON'Range loop
         if JSON (K) = '[' then
            Start_Idx := K;
         elsif JSON (K) = ']' then
            End_Idx := K;
            exit;
         end if;
      end loop;

      if Start_Idx = -1 or End_Idx = -1 or Start_Idx >= End_Idx then
         return Result;
      end if;

      for K in Start_Idx + 1 .. End_Idx - 1 loop
         declare
            C : constant Character := JSON (K);
         begin
            if C = '-' or (C >= '0' and C <= '9') then
               Append (Buffer, C);
            elsif C = ',' or C = ' ' or K = End_Idx - 1 then
               if Length (Buffer) > 0 then
                  Result.Append (Integer'Value (To_String (Buffer)));
                  Buffer := Null_Unbounded_String;
               end if;
            end if;
         end;
      end loop;

      if Length (Buffer) > 0 then
         Result.Append (Integer'Value (To_String (Buffer)));
      end if;

      return Result;
   exception
      when E : others =>
         Log ("Exception in Parse_Array: " & Ada.Exceptions.Exception_Message (E));
         return Result;
   end Parse_Array;

   -- Helper to find string between quotes starting from Index
   procedure Find_Next_String (Src : String; Start : in out Positive; Val : out Unbounded_String; Found : out Boolean) is
      Quote_1 : Integer := -1;
      Quote_2 : Integer := -1;
   begin
      Found := False;
      Val := Null_Unbounded_String;
      
      for K in Start .. Src'Length loop
         if Src (K) = '"' then
            if Quote_1 = -1 then
               Quote_1 := K;
            else
               Quote_2 := K;
               Start := K + 1;
               Found := True;
               Val := To_Unbounded_String (Src (Quote_1 + 1 .. Quote_2 - 1));
               exit;
            end if;
         end if;
      end loop;
   end Find_Next_String;

   -- Custom lightweight JSON parser for graph structures
   procedure Parse_Graph (JSON : String; Nodes : out Topological_Sort.String_Vectors.Vector; Edges : out Topological_Sort.Edge_Vectors.Vector) is
      Nodes_Start : Integer := -1;
      Nodes_End   : Integer := -1;
      Edges_Start : Integer := -1;
      Edges_End   : Integer := -1;
      K           : Positive := 1;
   begin
      -- Find "nodes" key
      for I in 1 .. JSON'Length - 6 loop
         if JSON (I .. I + 6) = """nodes""" then
            -- Find matching [ and ]
            for J in I + 7 .. JSON'Length loop
               if JSON (J) = '[' then
                  Nodes_Start := J;
               elsif JSON (J) = ']' then
                  Nodes_End := J;
                  exit;
               end if;
            end loop;
            exit;
         end if;
      end loop;

      -- Parse nodes
      if Nodes_Start /= -1 and Nodes_End /= -1 then
         K := Nodes_Start + 1;
         loop
            declare
               Node_Val : Unbounded_String;
               Found    : Boolean;
            begin
               exit when K >= Nodes_End;
               Find_Next_String (JSON, K, Node_Val, Found);
               if Found then
                  Nodes.Append (Node_Val);
               else
                  exit;
               end if;
            end;
         end loop;
      end if;

      -- Find "edges" key
      for I in 1 .. JSON'Length - 6 loop
         if JSON (I .. I + 6) = """edges""" then
            for J in I + 7 .. JSON'Length loop
               if JSON (J) = '[' then
                  Edges_Start := J;
               elsif JSON (J) = ']' then
                  Edges_End := J;
                  exit;
               end if;
            end loop;
            exit;
         end if;
      end loop;

      -- Parse edges
      if Edges_Start /= -1 and Edges_End /= -1 then
         K := Edges_Start + 1;
         while K < Edges_End loop
            -- Look for { and }
            declare
               Edge_Block_Start : Integer := -1;
               Edge_Block_End   : Integer := -1;
            begin
               for I in K .. Edges_End loop
                  if JSON (I) = '{' then
                     Edge_Block_Start := I;
                  elsif JSON (I) = '}' then
                     Edge_Block_End := I;
                     K := I + 1;
                     exit;
                  end if;
               end loop;

               exit when Edge_Block_Start = -1 or Edge_Block_End = -1;

               -- Parse edge fields from {from: "A", to: "B"}
               declare
                  Block : constant String := JSON (Edge_Block_Start .. Edge_Block_End);
                  From_Val : Unbounded_String := Null_Unbounded_String;
                  To_Val   : Unbounded_String := Null_Unbounded_String;
                  Ptr      : Positive := 1;
               begin
                  for I in 1 .. Block'Length - 6 loop
                     if Block (Edge_Block_Start + I - 1 .. Edge_Block_Start + I + 4) = """from""" then
                        Ptr := Edge_Block_Start + I + 5;
                        declare
                           Val : Unbounded_String;
                           Found : Boolean;
                        begin
                           Find_Next_String (JSON, Ptr, Val, Found);
                           if Found then
                              From_Val := Val;
                           end if;
                        end;
                     elsif Block (Edge_Block_Start + I - 1 .. Edge_Block_Start + I + 2) = """to""" then
                        Ptr := Edge_Block_Start + I + 3;
                        declare
                           Val : Unbounded_String;
                           Found : Boolean;
                        begin
                           Find_Next_String (JSON, Ptr, Val, Found);
                           if Found then
                              To_Val := Val;
                           end if;
                        end;
                     end if;
                  end loop;

                  if Length (From_Val) > 0 and Length (To_Val) > 0 then
                     Edges.Append (Topological_Sort.Edge_Type'(From_Node => From_Val, To_Node => To_Val));
                  end if;
               end;
            end;
         end loop;
      end if;
   exception
      when E : others =>
         Log ("Exception in Parse_Graph: " & Ada.Exceptions.Exception_Message (E));
   end Parse_Graph;

   -- Helper to parse Content-Length from headers
   function Get_Content_Length (Headers : String) return Integer is
      Pos : Integer := -1;
   begin
      -- Look for Content-Length case-insensitively
      for I in 1 .. Headers'Length - 15 loop
         declare
            Sub : constant String := Headers (I .. I + 14);
         begin
            if Sub = "Content-Length:" or Sub = "content-length:" or Sub = "Content-length:" then
               Pos := I + 15;
               exit;
            end if;
         end;
      end loop;

      if Pos = -1 then
         return 0;
      end if;

      declare
         Buffer : Unbounded_String;
      begin
         for I in Pos .. Headers'Length loop
            declare
               C : constant Character := Headers (I);
            begin
               if C >= '0' and C <= '9' then
                  Append (Buffer, C);
               elsif Length (Buffer) > 0 then
                  exit;
               end if;
            end;
         end loop;

         if Length (Buffer) > 0 then
            return Integer'Value (To_String (Buffer));
         end if;
      end;

      return 0;
   exception
      when others =>
         return 0;
   end Get_Content_Length;

   procedure Handle_Request (Channel : Stream_Access) is
      Headers : Unbounded_String;
      Char    : Character;
      Last_4  : String (1 .. 4) := (others => ' ');
      Content_Length : Integer := 0;
      Body_Str : Unbounded_String;
      
      Method : Unbounded_String;
      Path   : Unbounded_String;
   begin
      -- 1. Read HTTP Headers
      loop
         Char := Character'Input (Channel);
         Append (Headers, Char);
         Last_4 := Last_4 (2 .. 4) & Char;
         exit when Last_4 = ASCII.CR & ASCII.LF & ASCII.CR & ASCII.LF;
      end loop;

      declare
         Headers_Str : constant String := To_String (Headers);
         First_Line_End : Integer := -1;
      begin
         -- Parse Method and Path from first line (e.g. POST /api/sort/bubble HTTP/1.1)
         for I in Headers_Str'Range loop
            if Headers_Str (I) = ASCII.LF then
               First_Line_End := I;
               exit;
            end if;
         end loop;

         if First_Line_End /= -1 then
            declare
               First_Line : constant String := Headers_Str (Headers_Str'First .. First_Line_End - 2); -- trim \r
               S1 : Integer := -1;
               S2 : Integer := -1;
            begin
               for I in First_Line'Range loop
                  if First_Line (I) = ' ' then
                     if S1 = -1 then
                        S1 := I;
                     else
                        S2 := I;
                        exit;
                     end if;
                  end if;
               end loop;

               if S1 /= -1 and S2 /= -1 then
                  Method := To_Unbounded_String (First_Line (First_Line'First .. S1 - 1));
                  Path := To_Unbounded_String (First_Line (S1 + 1 .. S2 - 1));
               end if;
            end;
         end if;

         Content_Length := Get_Content_Length (Headers_Str);
      end;

      -- 2. Read Request Body
      for K in 1 .. Content_Length loop
         Char := Character'Input (Channel);
         Append (Body_Str, Char);
      end loop;

      declare
         Method_Str : constant String := To_String (Method);
         Path_Str   : constant String := To_String (Path);
         Req_Body   : constant String := To_String (Body_Str);
         Response   : Unbounded_String;
         JSON_Res   : Unbounded_String;
      begin
         Log (Method_Str & " " & Path_Str & " [Body Length: " & Content_Length'Image & "]");

         -- 3. CORS Preflight
         if Method_Str = "OPTIONS" then
            Response := To_Unbounded_String ("HTTP/1.1 204 No Content" & ASCII.CR & ASCII.LF &
               "Access-Control-Allow-Origin: *" & ASCII.CR & ASCII.LF &
               "Access-Control-Allow-Methods: POST, GET, OPTIONS" & ASCII.CR & ASCII.LF &
               "Access-Control-Allow-Headers: Content-Type, Authorization" & ASCII.CR & ASCII.LF &
               "Access-Control-Max-Age: 86400" & ASCII.CR & ASCII.LF &
               "Content-Length: 0" & ASCII.CR & ASCII.LF &
               "Connection: close" & ASCII.CR & ASCII.LF & ASCII.CR & ASCII.LF);
            String'Write (Channel, To_String (Response));
            return;
         end if;

         -- 4. Route POST Requests
         if Method_Str = "POST" then
            if Path_Str = "/api/sort/bubble" or else
               Path_Str = "/api/sort/selection" or else
               Path_Str = "/api/sort/insertion" or else
               Path_Str = "/api/sort/quick" or else
               Path_Str = "/api/sort/merge" or else
               Path_Str = "/api/sort/heap"
            then
               declare
                  Input_Arr : constant Element_Vectors.Vector := Parse_Array (Req_Body);
               begin
                  if Path_Str = "/api/sort/bubble" then
                     JSON_Res := To_Json (Bubble_Sort.Sort (Input_Arr), "Bubble Sort");
                  elsif Path_Str = "/api/sort/selection" then
                     JSON_Res := To_Json (Selection_Sort.Sort (Input_Arr), "Selection Sort");
                  elsif Path_Str = "/api/sort/insertion" then
                     JSON_Res := To_Json (Insertion_Sort.Sort (Input_Arr), "Insertion Sort");
                  elsif Path_Str = "/api/sort/quick" then
                     JSON_Res := To_Json (Quick_Sort.Sort (Input_Arr), "Quick Sort");
                  elsif Path_Str = "/api/sort/merge" then
                     JSON_Res := To_Json (Merge_Sort.Sort (Input_Arr), "Merge Sort");
                  elsif Path_Str = "/api/sort/heap" then
                     JSON_Res := To_Json (Heap_Sort.Sort (Input_Arr), "Heap Sort");
                  end if;
               end;

            elsif Path_Str = "/api/topological" then
               declare
                  Nodes : Topological_Sort.String_Vectors.Vector;
                  Edges : Topological_Sort.Edge_Vectors.Vector;
               begin
                  Parse_Graph (Req_Body, Nodes, Edges);
                  JSON_Res := Topological_Sort.To_Json (Topological_Sort.Run_Topo_Sort (Nodes, Edges));
               end;
            else
               -- 404 Route
               JSON_Res := To_Unbounded_String ("{""error"":""Endpoint not found""}");
               Response := To_Unbounded_String ("HTTP/1.1 404 Not Found" & ASCII.CR & ASCII.LF &
                  "Access-Control-Allow-Origin: *" & ASCII.CR & ASCII.LF &
                  "Content-Type: application/json" & ASCII.CR & ASCII.LF &
                  "Content-Length: " & Trim (Integer'Image (Length (JSON_Res))) & ASCII.CR & ASCII.LF &
                  "Connection: close" & ASCII.CR & ASCII.LF & ASCII.CR & ASCII.LF & To_String (JSON_Res));
               String'Write (Channel, To_String (Response));
               return;
            end if;

            -- Send 200 OK Response
            Response := To_Unbounded_String ("HTTP/1.1 200 OK" & ASCII.CR & ASCII.LF &
               "Access-Control-Allow-Origin: *" & ASCII.CR & ASCII.LF &
               "Content-Type: application/json" & ASCII.CR & ASCII.LF &
               "Content-Length: " & Trim (Integer'Image (Length (JSON_Res))) & ASCII.CR & ASCII.LF &
               "Connection: close" & ASCII.CR & ASCII.LF & ASCII.CR & ASCII.LF & To_String (JSON_Res));
            String'Write (Channel, To_String (Response));
            return;
         end if;

         -- Standard GET Check
         JSON_Res := To_Unbounded_String ("{""status"":""ok"",""message"":""AdaSortLab backend is running!""}");
         Response := To_Unbounded_String ("HTTP/1.1 200 OK" & ASCII.CR & ASCII.LF &
            "Access-Control-Allow-Origin: *" & ASCII.CR & ASCII.LF &
            "Content-Type: application/json" & ASCII.CR & ASCII.LF &
            "Content-Length: " & Trim (Integer'Image (Length (JSON_Res))) & ASCII.CR & ASCII.LF &
            "Connection: close" & ASCII.CR & ASCII.LF & ASCII.CR & ASCII.LF & To_String (JSON_Res));
         String'Write (Channel, To_String (Response));
      end;
   exception
      when E : others =>
         Log ("Exception handling connection: " & Ada.Exceptions.Exception_Message (E));
         -- Try to send a 500 error back to not hang client
         begin
            declare
               Err_JSON : constant String := "{""error"":""Internal Server Error""}";
               Response : constant String := "HTTP/1.1 500 Internal Server Error" & ASCII.CR & ASCII.LF &
                  "Access-Control-Allow-Origin: *" & ASCII.CR & ASCII.LF &
                  "Content-Type: application/json" & ASCII.CR & ASCII.LF &
                  "Content-Length: " & Trim (Integer'Image (Err_JSON'Length)) & ASCII.CR & ASCII.LF &
                  "Connection: close" & ASCII.CR & ASCII.LF & ASCII.CR & ASCII.LF & Err_JSON;
            begin
               String'Write (Channel, Response);
            end;
         exception
            when others => null; -- client closed socket
         end;
   end Handle_Request;

   procedure Start (Port : Positive := 8080) is
      Address : Sock_Addr_Type;
      Server  : Socket_Type;
      Client  : Socket_Type;
      Channel : Stream_Access;
   begin
      Initialize;
      Create_Socket (Server);
      Set_Socket_Option (Server, Socket_Level, (Reuse_Address, True));
      
      Address.Addr := Any_Inet_Addr;
      Address.Port := Port_Type (Port);
      
      Bind_Socket (Server, Address);
      Listen_Socket (Server);
      
      Log ("Server listening on port" & Port'Image & "...");
      
      loop
         begin
            Accept_Socket (Server, Client, Address);
            Channel := Stream (Client);
            Handle_Request (Channel);
            Close_Socket (Client);
         exception
            when E : others =>
               Log ("Exception in accept loop: " & Ada.Exceptions.Exception_Message (E));
               if Client /= No_Socket then
                  begin
                     Close_Socket (Client);
                  exception
                     when others => null;
                  end;
               end if;
         end;
      end loop;
   exception
      when E : others =>
         Log ("Fatal server exception: " & Ada.Exceptions.Exception_Message (E));
         Finalize;
   end Start;

end API_Server;
