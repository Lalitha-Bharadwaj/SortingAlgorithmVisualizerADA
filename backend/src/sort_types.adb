with Ada.Strings.Fixed;
with Ada.Strings.Unbounded; use Ada.Strings.Unbounded;
with Ada.Text_IO;

package body Sort_Types is

   function Action_Img (Act : Action_Kind) return String is
   begin
      case Act is
         when Compare => return "compare";
         when Swap    => return "swap";
         when Set     => return "set";
         when Pivot   => return "pivot";
         when Merge   => return "merge";
         when Sorted  => return "sorted";
      end case;
   end Action_Img;

   function Trim (S : String) return String is
   begin
      return Ada.Strings.Fixed.Trim (S, Ada.Strings.Both);
   end Trim;

   function To_Json (Step : Trace_Step) return Unbounded_String is
      Result : Unbounded_String;
      Indices_Str : Unbounded_String;
      Arr_Str : Unbounded_String;
      First : Boolean;
   begin
      Result := To_Unbounded_String ("{""step"":");
      Append (Result, Trim (Integer'Image (Step.Step_Num)));
      Append (Result, ",""action"":""" & Action_Img (Step.Action) & """,");

      -- Serialize indices
      Append (Result, """indices"":[");
      First := True;
      for Idx of Step.Indices loop
         if not First then
            Append (Result, ",");
         end if;
         Append (Result, Trim (Integer'Image (Idx)));
         First := False;
      end loop;
      Append (Result, "],");

      -- Serialize array state
      Append (Result, """array"":[");
      First := True;
      for Val of Step.Arr loop
         if not First then
            Append (Result, ",");
         end if;
         Append (Result, Trim (Integer'Image (Val)));
         First := False;
      end loop;
      Append (Result, "]}");

      return Result;
   end To_Json;

   function To_Json (Result : Sort_Result; Algo_Name : String) return Unbounded_String is
      Output : Unbounded_String;
      First : Boolean;
      Float_Str : constant String := Trim (Float'Image (Result.Time_Ms));
   begin
      Output := To_Unbounded_String ("{");
      Append (Output, """algorithm"":""" & Algo_Name & """,");
      Append (Output, """comparisonsCount"":" & Trim (Integer'Image (Result.Comparisons)) & ",");
      Append (Output, """swapsCount"":" & Trim (Integer'Image (Result.Swaps)) & ",");
      Append (Output, """operationCount"":" & Trim (Integer'Image (Result.Operations)) & ",");
      Append (Output, """executionTime"":" & Float_Str & ",");
      Append (Output, """trace"":[");

      First := True;
      for Step of Result.Trace loop
         if not First then
            Append (Output, ",");
         end if;
         Append (Output, To_Json (Step));
         First := False;
      end loop;
      Append (Output, "]}");

      return Output;
   end To_Json;

end Sort_Types;
